import { app } from 'electron';
import { spawn, execSync, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import net from 'net';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

const isDev = process.env.NODE_ENV === 'development';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let phpProcess: ChildProcess | null = null;
let apiPort: number = 0;
let restartCount = 0;
const MAX_RESTARTS = 3;

/**
 * Get the path to the bundled PHP executable.
 * In dev: uses system PHP.
 * In production: uses the portable PHP bundled in resources.
 */
function getPhpPath(): string {
  if (isDev) {
    return 'php';
  }
  // In production, use bundled PHP from extraResources
  return path.join(process.resourcesPath, 'php', 'php.exe');
}

/**
 * Get the path to the Laravel API directory.
 * In dev: uses the sibling laravel-api folder.
 * In production: uses the bundled laravel-api in resources.
 */
function getLaravelPath(): string {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'laravel-api');
  }
  // In production, use bundled Laravel from extraResources
  return path.join(process.resourcesPath, 'laravel-api');
}

/**
 * Get the user data directory for persistent storage (DB, logs, storage).
 * On Windows: %APPDATA%/Brocante
 */
function getUserDataPath(): string {
  return path.join(app.getPath('userData'), 'data');
}

/**
 * Find a free port on localhost.
 */
function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        server.close(() => reject(new Error('Could not find free port')));
      }
    });
    server.on('error', reject);
  });
}

/**
 * Ensure the user data directories exist and set up the .env file.
 */
function setupEnvironment(laravelPath: string): string {
  const userDataPath = getUserDataPath();
  const dbDir = path.join(userDataPath, 'database');
  const storageDir = path.join(userDataPath, 'storage');
  const logsDir = path.join(storageDir, 'logs');
  const frameworkDir = path.join(storageDir, 'framework');
  const sessionsDir = path.join(frameworkDir, 'sessions');
  const viewsDir = path.join(frameworkDir, 'views');
  const cacheDir = path.join(frameworkDir, 'cache');

  // Create all required directories
  for (const dir of [dbDir, logsDir, sessionsDir, viewsDir, cacheDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const dbPath = path.join(dbDir, 'brocante.sqlite');

  // Create empty SQLite file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  // Create/update .env file for the Laravel API
  const envPath = path.join(laravelPath, '.env');
  const envPortablePath = path.join(laravelPath, '.env.portable');

  if (fs.existsSync(envPortablePath)) {
    let envContent = fs.readFileSync(envPortablePath, 'utf-8');
    // Replace placeholders with actual paths (use forward slashes for PHP)
    envContent = envContent.replace('PORTABLE_DB_PATH', dbPath.replace(/\\/g, '/'));

    // Generate APP_KEY if not already set
    if (envContent.includes('PORTABLE_KEY_WILL_BE_GENERATED')) {
      const key = 'base64:' + crypto.randomBytes(32).toString('base64');
      envContent = envContent.replace('base64:PORTABLE_KEY_WILL_BE_GENERATED', key);
      // Also update the .env.portable file so we keep the same key across restarts
      const updatedPortable = fs.readFileSync(envPortablePath, 'utf-8')
        .replace('base64:PORTABLE_KEY_WILL_BE_GENERATED', key);
      fs.writeFileSync(envPortablePath, updatedPortable, 'utf-8');
    }

    // Set storage path
    envContent += `\nSTORAGE_PATH=${storageDir.replace(/\\/g, '/')}\n`;

    fs.writeFileSync(envPath, envContent, 'utf-8');
  }

  return dbPath;
}

/**
 * Run Laravel artisan commands (migrate, seed, etc.).
 * Throws on error so caller can handle it.
 */
function runArtisan(phpPath: string, laravelPath: string, args: string[]): string {
  const artisanPath = path.join(laravelPath, 'artisan');
  const cmd = `"${phpPath}" "${artisanPath}" ${args.join(' ')}`;
  console.log(`[PHP Server] Running: ${cmd}`);
  const result = execSync(cmd, {
    cwd: laravelPath,
    timeout: 60000,
    encoding: 'utf-8',
    env: { 
      ...process.env, 
      APP_ENV: isDev ? 'local' : 'production'
    },
  });
  console.log(`[PHP Server] Artisan output: ${result}`);
  return result;
}

/**
 * Wait for the PHP server to be ready by attempting to connect to it.
 */
function waitForServer(port: number, host: string = 'localhost'): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50;
    let attempts = 0;

    const check = () => {
      attempts++;
      if (attempts % 5 === 0) {
        console.log(`[PHP Server] Connection attempt ${attempts}/${maxAttempts}...`);
      }

      const socket = new net.Socket();
      
      socket.setTimeout(500);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error(`PHP server did not start after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, 200);
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error(`PHP server did not start after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, 200);
        }
      });

      socket.connect(port, host);
    };

    check();
  });
}

/**
 * Check if this is the first launch (no database tables yet).
 */
function isFirstLaunch(dbPath: string): boolean {
  try {
    const stats = fs.statSync(dbPath);
    // If the file is empty (0 bytes), it's the first launch
    return stats.size === 0;
  } catch {
    return true;
  }
}

/**
 * Start the embedded PHP server with automatic restart on failure.
 * Returns the port number the server is running on.
 */
export async function startPhpServer(): Promise<number> {
  restartCount = 0;
  
  while (restartCount < MAX_RESTARTS) {
    try {
      const port = await startPhpServerOnce();
      return port;
    } catch (error: any) {
      restartCount++;
      console.error(`[PHP Server] Attempt ${restartCount}/${MAX_RESTARTS} failed:`, error.message);
      
      if (restartCount >= MAX_RESTARTS) {
        throw new Error(`Failed to start PHP server after ${MAX_RESTARTS} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await sleep(2000);
    }
  }
  
  throw new Error('Failed to start PHP server');
}

/**
 * Single attempt to start PHP server.
 */
async function startPhpServerOnce(): Promise<number> {
  const phpPath = getPhpPath();
  const laravelPath = getLaravelPath();

  console.log(`[PHP Server] PHP path: ${phpPath}`);
  console.log(`[PHP Server] Laravel path: ${laravelPath}`);
  
  // In dev mode, assume Laravel is already running on brocante.local (Nginx)
  if (isDev) {
    console.log(`[PHP Server] Dev mode — using brocante.local (Nginx)`);
    return 80; // Nginx default port, but URL will be brocante.local
  }

  // Setup portable environment
  const dbPath = setupEnvironment(laravelPath);
  console.log(`[PHP Server] Database path: ${dbPath}`);

  // Quick PHP sanity check (only on first attempt)
  if (restartCount === 0) {
    try {
      execSync(`"${phpPath}" -r "echo 'ok';"`, { encoding: 'utf-8', timeout: 3000 });
    } catch (e: any) {
      throw new Error(`PHP not working: ${e.message}`);
    }
  }

  // Find a free port
  apiPort = await findFreePort();
  console.log(`[PHP Server] Using port: ${apiPort}`);

  // Smart database initialization: only seed on first launch
  const firstLaunch = isFirstLaunch(dbPath);

  if (firstLaunch) {
    console.log('[PHP Server] First launch detected: initializing database...');
    try {
      fs.closeSync(fs.openSync(dbPath, 'w'));
      console.log('[PHP Server] Created new empty database file');
    } catch (e: any) {
      console.error('[PHP Server] Error creating database:', e.message);
    }
    runArtisan(phpPath, laravelPath, ['migrate', '--force']);
    runArtisan(phpPath, laravelPath, ['db:seed', '--force']);
    console.log('[PHP Server] Database initialized with seed data.');
  } else {
    // Run migrations in background — don't block server start for existing DBs
    console.log('[PHP Server] Existing database: running migrations async...');
    try {
      const artisanPath = path.join(laravelPath, 'artisan');
      spawn(phpPath, [artisanPath, 'migrate', '--force'], {
        cwd: laravelPath,
        stdio: 'ignore',
        windowsHide: true,
        env: { ...process.env, APP_ENV: 'production' },
      });
    } catch (e: any) {
      console.warn('[PHP Server] Async migration failed, will retry:', e.message);
    }
  }

  // Cache config + routes for production (fast startup)
  try {
    runArtisan(phpPath, laravelPath, ['config:cache']);
    runArtisan(phpPath, laravelPath, ['route:cache']);
  } catch (e: any) {
    console.warn('[PHP Server] Cache commands failed (non-critical):', e.message);
  }

  // Start the PHP built-in server DIRECTLY (not via artisan serve)
  // artisan serve spawns a child php process that can't find php.exe in PATH
  const logFile = path.join(getUserDataPath(), 'php-server.log');
  console.log(`[PHP Server] Logging to: ${logFile}`);
  
  // Kill any existing PHP processes
  try {
    execSync(`taskkill /F /IM php.exe 2>nul`, { stdio: 'ignore' });
  } catch {}
  
  // Use php -S directly with server.php as router
  const serverPhp = path.join(laravelPath, 'server.php');
  console.log(`[PHP Server] Spawning: ${phpPath} -S 0.0.0.0:${apiPort} ${serverPhp}`);
  console.log(`[PHP Server] CWD: ${laravelPath}`);
  
  phpProcess = spawn(phpPath, ['-S', `0.0.0.0:${apiPort}`, serverPhp], {
    cwd: laravelPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    shell: false,
    env: { 
      ...process.env, 
      APP_ENV: 'production',
      APP_DEBUG: 'false',
      PATH: process.env.PATH
    },
  });

  console.log(`[PHP Server] Process spawned with PID: ${phpProcess.pid}`);

  // Log all output to file and console
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  phpProcess.stdout?.on('data', (data: Buffer) => {
    const msg = data.toString().trim();
    console.log(`[PHP Server] ${msg}`);
    logStream.write(`[STDOUT] ${msg}\n`);
  });

  phpProcess.stderr?.on('data', (data: Buffer) => {
    const msg = data.toString().trim();
    console.error(`[PHP Server ERR] ${msg}`);
    logStream.write(`[STDERR] ${msg}\n`);
  });

  phpProcess.on('exit', (code, signal) => {
    const msg = `Process exited with code ${code}, signal ${signal}`;
    console.log(`[PHP Server] ${msg}`);
    logStream.write(`[EXIT] ${msg}\n`);
    logStream.end();
    phpProcess = null;
  });

  phpProcess.on('error', (err) => {
    const msg = `Failed to start: ${err.message}`;
    console.error('[PHP Server]', msg);
    logStream.write(`[ERROR] ${msg}\n`);
  });

  // Wait for server to be ready
  console.log('[PHP Server] Waiting for server to accept connections...');
  await waitForServer(apiPort, '127.0.0.1');
  
  // Check if process is still alive
  if (!phpProcess || phpProcess.exitCode !== null) {
    const exitCode = phpProcess?.exitCode ?? 'null';
    throw new Error(`PHP server process died (exit code: ${exitCode})`);
  }
  
  console.log(`[PHP Server] ✅ Server is ready on http://127.0.0.1:${apiPort}`);

  return apiPort;
}

/**
 * Stop the PHP server.
 */
export function stopPhpServer(): void {
  if (phpProcess) {
    console.log('[PHP Server] Stopping...');
    try {
      // On Windows, we need to kill the process tree
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${phpProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        phpProcess.kill('SIGTERM');
      }
    } catch (e) {
      console.error('[PHP Server] Error stopping:', e);
      try {
        phpProcess.kill('SIGKILL');
      } catch {
        // Process might already be dead
      }
    }
    phpProcess = null;
    console.log('[PHP Server] Stopped.');
  }
}

/**
 * Get the current API port.
 */
export function getApiPort(): number {
  return apiPort;
}

/**
 * Wait for the API port to be available (server ready).
 * Returns a promise that resolves with the port number.
 */
export function waitForApiPort(timeoutMs: number = 30000): Promise<number> {
  return new Promise((resolve, reject) => {
    if (apiPort > 0) {
      resolve(apiPort);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (apiPort > 0) {
        clearInterval(checkInterval);
        resolve(apiPort);
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for API port'));
      }
    }, 100);
  });
}

/**
 * Get the base URL for the API.
 */
export function getApiBaseUrl(): string {
  if (isDev) {
    return 'http://brocante.local/api/v1';
  }
  return `http://127.0.0.1:${apiPort}/api/v1`;
}

/**
 * Get database info (path, size, last modified).
 */
export function getDatabaseInfo(): { path: string; size: number; lastModified: string; exists: boolean } {
  const dbPath = path.join(getUserDataPath(), 'database', 'brocante.sqlite');
  try {
    const stats = fs.statSync(dbPath);
    return {
      path: dbPath,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      exists: true, 
    };
  } catch {
    return { path: dbPath, size: 0, lastModified: '', exists: false };
  }
}

/**
 * Get key paths used by the application.
 */
export function getAppPaths() {
  return {
    userData: getUserDataPath(),
    database: path.join(getUserDataPath(), 'database', 'brocante.sqlite'),
    laravel: getLaravelPath(),
    php: getPhpPath(),
  };
}

/**
 * Reset the database: wipe + migrate + seed.
 * Returns true on success.
 */
export function resetDatabase(): boolean {
  const phpPath = getPhpPath();
  const laravelPath = getLaravelPath();
  const dbPath = path.join(getUserDataPath(), 'database', 'brocante.sqlite');

  try {
    // Delete and recreate
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    fs.closeSync(fs.openSync(dbPath, 'w'));
    runArtisan(phpPath, laravelPath, ['migrate', '--force']);
    runArtisan(phpPath, laravelPath, ['db:seed', '--force']);
    return true;
  } catch (e: any) {
    console.error('[PHP Server] Reset failed:', e.message);
    return false;
  }
}

/**
 * Load demo/test data into the existing database.
 * Runs ConfigSeeder which includes all demo data and product templates.
 */
export function seedDemoData(): boolean {
  const phpPath = getPhpPath();
  const laravelPath = getLaravelPath();

  try {
    runArtisan(phpPath, laravelPath, ['db:seed', '--class=ConfigSeeder', '--force']);
    return true;
  } catch (e: any) {
    console.error('[PHP Server] Demo seed failed:', e.message);
    return false;
  }
}

/**
 * Replace the current database with an imported file.
 */
export function importDatabase(sourcePath: string): boolean {
  const dbPath = path.join(getUserDataPath(), 'database', 'brocante.sqlite');
  const phpPath = getPhpPath();
  const laravelPath = getLaravelPath();

  try {
    // Stop any DB activity first
    fs.copyFileSync(sourcePath, dbPath);
    // Run migrations on the imported DB to ensure schema is up to date
    runArtisan(phpPath, laravelPath, ['migrate', '--force']);
    return true;
  } catch (e: any) {
    console.error('[PHP Server] Import failed:', e.message);
    return false;
  }
}
