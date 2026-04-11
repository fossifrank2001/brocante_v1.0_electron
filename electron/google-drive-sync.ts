import { app, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import crypto from 'crypto';

/**
 * Google Drive Sync Module for Brocante POS.
 * 
 * Uses OAuth2 authorization code flow:
 * 1. User clicks "Connecter Google Drive"
 * 2. Browser opens Google consent screen
 * 3. User authorizes → redirect to localhost callback
 * 4. We exchange the code for tokens and store them
 * 
 * Backup files are stored in a "Brocante-Backups" folder on the user's Drive.
 */

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

interface DriveFile {
  id: string;
  name: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
}

interface SyncConfig {
  clientId: string;
  clientSecret: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalMinutes: number;
  lastSyncTime: string;
  lastSyncDirection: 'upload' | 'download' | '';
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const REDIRECT_PORT = 48521;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;
const DRIVE_FOLDER_NAME = 'Brocante-Backups';

export class GoogleDriveSync {
  private configDir: string;
  private tokenPath: string;
  private configPath: string;
  private config: SyncConfig;
  private tokens: TokenData | null = null;
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private driveFolderId: string | null = null;

  constructor() {
    this.configDir = path.join(app.getPath('userData'), 'cloud-config');
    this.tokenPath = path.join(this.configDir, 'gdrive-tokens.json');
    this.configPath = path.join(this.configDir, 'gdrive-config.json');

    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    this.config = this.loadConfig();
    this.tokens = this.loadTokens();

    if (this.config.autoSyncEnabled) {
      this.startAutoSync();
    }
  }

  private loadConfig(): SyncConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      }
    } catch (e) {
      console.error('[GDrive] Failed to load config:', e);
    }
    return {
      clientId: '',
      clientSecret: '',
      autoSyncEnabled: false,
      autoSyncIntervalMinutes: 30,
      lastSyncTime: '',
      lastSyncDirection: '',
    };
  }

  private saveConfig(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  private loadTokens(): TokenData | null {
    try {
      if (fs.existsSync(this.tokenPath)) {
        return JSON.parse(fs.readFileSync(this.tokenPath, 'utf-8'));
      }
    } catch (e) {
      console.error('[GDrive] Failed to load tokens:', e);
    }
    return null;
  }

  private saveTokens(tokens: TokenData): void {
    this.tokens = tokens;
    fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2), 'utf-8');
  }

  // ─── Configuration ───────────────────────────────
  
  configure(clientId: string, clientSecret: string): void {
    this.config.clientId = clientId;
    this.config.clientSecret = clientSecret;
    this.saveConfig();
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  isAuthenticated(): boolean {
    return !!(this.tokens && this.tokens.access_token);
  }

  // ─── OAuth2 Authentication ───────────────────────

  async authenticate(): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Google Drive n\'est pas configuré. Veuillez entrer le Client ID et Client Secret.');
    }

    return new Promise((resolve, reject) => {
      // Generate PKCE code verifier
      const state = crypto.randomBytes(16).toString('hex');

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.config.clientId);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES.join(' '));
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);

      // Start local server to receive the callback
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', `http://localhost:${REDIRECT_PORT}`);

        if (url.pathname === '/oauth2callback') {
          const code = url.searchParams.get('code');
          const returnedState = url.searchParams.get('state');

          if (returnedState !== state) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>❌ Erreur de sécurité</h1><p>State mismatch. Veuillez réessayer.</p>');
            server.close();
            reject(new Error('State mismatch'));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>❌ Erreur</h1><p>Aucun code d\'autorisation reçu.</p>');
            server.close();
            reject(new Error('No authorization code'));
            return;
          }

          try {
            const tokens = await this.exchangeCode(code);
            this.saveTokens(tokens);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0fdf4">
                <div style="text-align:center;padding:40px;background:white;border-radius:24px;box-shadow:0 20px 40px rgba(0,0,0,0.1)">
                  <h1 style="color:#10b981;font-size:3rem;margin:0">✅</h1>
                  <h2 style="color:#1e293b">Connecté à Google Drive !</h2>
                  <p style="color:#64748b">Vous pouvez fermer cet onglet et retourner à Brocante.</p>
                </div>
              </body></html>
            `);
            server.close();
            resolve(true);
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>❌ Erreur</h1><p>Impossible d\'obtenir les tokens.</p>');
            server.close();
            reject(e);
          }
        }
      });

      server.listen(REDIRECT_PORT, () => {
        console.log(`[GDrive] OAuth callback server listening on port ${REDIRECT_PORT}`);
        shell.openExternal(authUrl.toString());
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout (2 minutes)'));
      }, 120000);
    });
  }

  private exchangeCode(code: string): Promise<TokenData> {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString();

      const req = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(`Token exchange failed: ${json.error_description || json.error}`));
              return;
            }
            resolve({
              access_token: json.access_token,
              refresh_token: json.refresh_token,
              expires_at: Date.now() + (json.expires_in * 1000),
            });
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error('Aucun refresh token. Veuillez vous reconnecter.');
    }

    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.tokens!.refresh_token!,
        grant_type: 'refresh_token',
      }).toString();

      const req = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(`Token refresh failed: ${json.error_description || json.error}`));
              return;
            }
            this.saveTokens({
              access_token: json.access_token,
              refresh_token: this.tokens!.refresh_token, // keep existing refresh token
              expires_at: Date.now() + (json.expires_in * 1000),
            });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private async getValidToken(): Promise<string> {
    if (!this.tokens) throw new Error('Non authentifié');
    
    if (Date.now() >= this.tokens.expires_at - 60000) {
      await this.refreshAccessToken();
    }
    
    return this.tokens!.access_token;
  }

  // ─── Drive API Helpers ───────────────────────────

  private driveApiRequest(options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
    isUpload?: boolean;
  }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const token = await this.getValidToken();
      const hostname = options.isUpload ? 'www.googleapis.com' : 'www.googleapis.com';
      
      const reqOptions: https.RequestOptions = {
        hostname,
        path: options.path,
        method: options.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      };

      const req = https.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Drive API error ${res.statusCode}: ${data}`));
              return;
            }
            resolve(data ? JSON.parse(data) : {});
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  }

  private async findOrCreateFolder(): Promise<string> {
    if (this.driveFolderId) return this.driveFolderId;

    // Search for existing folder
    const query = `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const result = await this.driveApiRequest({
      method: 'GET',
      path: `/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    });

    if (result.files && result.files.length > 0) {
      this.driveFolderId = result.files[0].id;
      return this.driveFolderId!;
    }

    // Create folder
    const folder = await this.driveApiRequest({
      method: 'POST',
      path: '/drive/v3/files',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    this.driveFolderId = folder.id;
    return this.driveFolderId!;
  }

  // ─── Public Sync Operations ──────────────────────

  async uploadBackup(dbPath: string): Promise<{ success: boolean; fileName: string }> {
    const folderId = await this.findOrCreateFolder();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `brocante-backup-${timestamp}.sqlite`;
    
    const fileContent = fs.readFileSync(dbPath);
    
    const metadata = JSON.stringify({
      name: fileName,
      parents: [folderId],
    });

    const boundary = '-------brocante-boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const bodyParts = [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadata,
      delimiter,
      'Content-Type: application/x-sqlite3\r\n',
      'Content-Transfer-Encoding: base64\r\n\r\n',
      fileContent.toString('base64'),
      closeDelimiter,
    ];
    
    const body = bodyParts.join('');

    await this.driveApiRequest({
      method: 'POST',
      path: '/upload/drive/v3/files?uploadType=multipart&fields=id,name',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body).toString(),
      },
      body,
      isUpload: true,
    });

    this.config.lastSyncTime = new Date().toISOString();
    this.config.lastSyncDirection = 'upload';
    this.saveConfig();

    console.log(`[GDrive] Backup uploaded: ${fileName}`);
    return { success: true, fileName };
  }

  async listBackups(): Promise<DriveFile[]> {
    const folderId = await this.findOrCreateFolder();
    
    const query = `'${folderId}' in parents and trashed=false`;
    const result = await this.driveApiRequest({
      method: 'GET',
      path: `/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,size,createdTime,modifiedTime)&orderBy=createdTime desc&pageSize=20`,
    });

    return result.files || [];
  }

  async downloadBackup(fileId: string, destinationPath: string): Promise<boolean> {
    const token = await this.getValidToken();

    // ⚠️ Safety: backup current local DB before overwriting
    if (fs.existsSync(destinationPath)) {
      const bakPath = destinationPath + '.bak';
      try {
        fs.copyFileSync(destinationPath, bakPath);
        console.log(`[GDrive] Local DB backed up to: ${bakPath}`);
      } catch (e) {
        console.warn('[GDrive] Could not create safety backup, proceeding anyway:', e);
      }
    }

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'www.googleapis.com',
        path: `/drive/v3/files/${fileId}?alt=media`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed with status ${res.statusCode}`));
          return;
        }
        
        const fileStream = fs.createWriteStream(destinationPath);
        res.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          this.config.lastSyncTime = new Date().toISOString();
          this.config.lastSyncDirection = 'download';
          this.saveConfig();
          console.log(`[GDrive] Backup downloaded to: ${destinationPath}`);
          resolve(true);
        });
        
        fileStream.on('error', (err) => {
          // Restore from backup on write error
          const bakPath = destinationPath + '.bak';
          if (fs.existsSync(bakPath)) {
            try { fs.copyFileSync(bakPath, destinationPath); } catch {}
          }
          reject(err);
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async deleteBackup(fileId: string): Promise<boolean> {
    await this.driveApiRequest({
      method: 'DELETE',
      path: `/drive/v3/files/${fileId}`,
    });
    return true;
  }

  // ─── Auto Sync ───────────────────────────────────

  startAutoSync(): void {
    if (this.autoSyncTimer) clearInterval(this.autoSyncTimer);
    
    const intervalMs = this.config.autoSyncIntervalMinutes * 60 * 1000;
    
    this.autoSyncTimer = setInterval(async () => {
      if (!this.isAuthenticated()) return;
      
      try {
        const dbPath = path.join(app.getPath('userData'), 'data', 'database', 'brocante.sqlite');
        if (fs.existsSync(dbPath)) {
          await this.uploadBackup(dbPath);
          console.log('[GDrive] Auto-sync backup completed');
        }
      } catch (e) {
        console.error('[GDrive] Auto-sync failed:', e);
      }
    }, intervalMs);

    console.log(`[GDrive] Auto-sync started (every ${this.config.autoSyncIntervalMinutes} min)`);
  }

  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }

  setAutoSync(enabled: boolean, intervalMinutes?: number): void {
    this.config.autoSyncEnabled = enabled;
    if (intervalMinutes) this.config.autoSyncIntervalMinutes = intervalMinutes;
    this.saveConfig();

    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  // ─── Disconnect ──────────────────────────────────

  disconnect(): void {
    this.tokens = null;
    this.driveFolderId = null;
    this.stopAutoSync();
    
    try {
      if (fs.existsSync(this.tokenPath)) fs.unlinkSync(this.tokenPath);
    } catch (e) {
      console.error('[GDrive] Failed to delete tokens:', e);
    }
  }

  getStatus(): {
    configured: boolean;
    authenticated: boolean;
    autoSyncEnabled: boolean;
    autoSyncInterval: number;
    lastSyncTime: string;
    lastSyncDirection: string;
  } {
    return {
      configured: this.isConfigured(),
      authenticated: this.isAuthenticated(),
      autoSyncEnabled: this.config.autoSyncEnabled,
      autoSyncInterval: this.config.autoSyncIntervalMinutes,
      lastSyncTime: this.config.lastSyncTime,
      lastSyncDirection: this.config.lastSyncDirection,
    };
  }
}
