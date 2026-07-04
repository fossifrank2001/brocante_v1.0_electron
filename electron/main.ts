import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { startPhpServer, stopPhpServer, getApiBaseUrl, getApiPort, waitForApiPort, getDatabaseInfo, resetDatabase, seedDemoData, importDatabase, getAppPaths } from './php-server.js';
import { GoogleDriveSync } from './google-drive-sync.js';
import { startDailyBackup, stopDailyBackup, listBackups, restoreBackup, createBackup } from './local-backup.js';
import { setupAutoUpdater, checkForUpdates, installUpdate, stopAutoUpdater } from './auto-updater.js';

const isDev = process.env.NODE_ENV === 'development';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = path.join(__dirname, '..');
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
path.join(APP_ROOT, 'dist-electron');
const RENDERER_DIST = path.join(APP_ROOT, 'dist');
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    resizable: true,
    movable: true,
    icon: path.join(VITE_PUBLIC, 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: true,
      webSecurity: false,
    }
  });

  // Désactiver le cache de la session en mode développement
  if (isDev) {
    mainWindow.webContents.session.clearCache();
    mainWindow.webContents.session.clearStorageData({
      storages: ['cachestorage', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers'],
    });
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);

    // Gérer les erreurs de connexion au serveur Vite
    let reloadAttempts = 0;
    const maxReloadAttempts = 30; // 30 tentatives max (60 secondes)
    let reloadInterval: NodeJS.Timeout | null = null;

    const startReloadPolling = () => {
      if (reloadInterval) return;

      reloadInterval = setInterval(() => {
        if (reloadAttempts >= maxReloadAttempts) {
          console.log('Max reload attempts reached, stopping polling');
          if (reloadInterval) clearInterval(reloadInterval);
          reloadInterval = null;
          return;
        }

        reloadAttempts++;
        console.log(`Checking if Vite server is back... (attempt ${reloadAttempts}/${maxReloadAttempts})`);

        // Vérifier si le serveur est de retour
        fetch(VITE_DEV_SERVER_URL)
          .then(() => {
            console.log('Vite server is back! Reloading...');
            if (reloadInterval) clearInterval(reloadInterval);
            reloadInterval = null;
            reloadAttempts = 0;
            mainWindow?.reload();
          })
          .catch(() => {
            // Serveur toujours down, continuer l'attente
          });
      }, 2000); // Vérifier toutes les 2 secondes
    };

    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.log(`Failed to load URL: ${validatedURL}, Error: ${errorDescription} (${errorCode})`);

      // Si c'est une erreur de connexion, commencer le polling
      if (errorCode === -28 || errorCode === -106 || errorCode === -102 || errorCode === -137 || errorCode === -300) {
        console.log('Connection error detected, starting reload polling...');
        startReloadPolling();
      }
    });

    // Forcer le rechargement quand le serveur est prêt
    mainWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready - Vite connection established');
      reloadAttempts = 0; // Reset counter on successful load
      if (reloadInterval) {
        clearInterval(reloadInterval);
        reloadInterval = null;
      }
    });
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Brocante',
      submenu: [
        {
          label: 'Point de Vente',
          accelerator: 'F1',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'pos' })
        },
        {
          label: 'Rechercher un produit',
          accelerator: 'F2',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'search' })
        },
        {
          label: 'Nouvelle vente',
          accelerator: 'F3',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'new-sale' })
        },
        {
          label: 'Historique des ventes',
          accelerator: 'F4',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'sales-history' })
        },
        { type: 'separator' },
        {
          label: 'Tableau de bord',
          accelerator: 'F5',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'dashboard' })
        },
        {
          label: 'Paramètres',
          accelerator: 'F9',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'settings' })
        },
        { type: 'separator' },
        {
          label: 'Sauvegarde manuelle',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'backup' })
        },
        {
          label: 'Synchroniser Google Drive',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('shortcut', { action: 'sync-drive' })
        },
      ]
    },
    {
      label: 'Outils',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win) {
              win.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload'
        },
        {
          label: 'Recharger (sans cache)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Documentation API',
          accelerator: 'CmdOrCtrl+D',
          click: () => mainWindow?.loadURL('http://127.0.0.1:8000/docs/api')
        },
      ]
    },
    {
      label: 'Accueil',
      accelerator: 'CmdOrCtrl+H',
      click: () => mainWindow?.webContents.send('navigate-home')
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.maximize();

  if (isDev) {
    mainWindow.webContents.once('dom-ready', async () => {
      try {
        const extensionNames = await Promise.all([
          installExtension(REDUX_DEVTOOLS),
          installExtension(REACT_DEVELOPER_TOOLS)
        ]);
        console.log('Added Extensions: ', extensionNames.join(', '));
      } catch (error) {
        console.error('Failed to install extensions:', error);
      }
    });
  }

  // Open DevTools only in development mode
  if (isDev) {
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow?.webContents.openDevTools();
    });
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  if (isDev) {
    try {
      await Promise.all([
        installExtension(REDUX_DEVTOOLS),
        installExtension(REACT_DEVELOPER_TOOLS)
      ]);
      console.log('Extensions installed successfully');
    } catch (error) {
      console.error('Failed to install extensions:', error);
    }
  }

  // Start the embedded PHP server (in production) or use existing one (in dev)
  try {
    const port = await startPhpServer();
    console.log(`[Main] API server available on port ${port}`);
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    console.error('[Main] Failed to start PHP server:', errMsg);
    dialog.showErrorBox('Erreur serveur API', 
      `Le serveur PHP n'a pas pu démarrer.\n\n${errMsg}\n\nresourcesPath: ${process.resourcesPath}`
    );
  }

  createWindow();

  // Start daily local backups
  startDailyBackup();

  // Setup auto-updater (production only)
  if (!isDev && mainWindow) {
    setupAutoUpdater(mainWindow);
  }
});

// ─── IPC Handler: Get API Base URL ───
ipcMain.handle('get-api-url', async () => {
  try {
    // Wait for the PHP server to be ready (port assigned)
    const port = await waitForApiPort(30000);
    return { baseUrl: `http://127.0.0.1:${port}/api/v1`, port };
  } catch (error: any) {
    console.error('[IPC] Error waiting for API port:', error);
    // Fallback to current values
    return { baseUrl: getApiBaseUrl(), port: getApiPort() };
  }
});

// ─── IPC Handlers for Thermal Printing ───
ipcMain.handle('get-printers', async () => {
  try {
    if (!mainWindow) throw new Error('Main window not available');
    const printers = await mainWindow.webContents.getPrintersAsync();
    return { success: true, printers };
  } catch (error: any) {
    console.error('Error getting printers:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print-thermal', async (_event, { printerName }: { printerName: string }) => {
  try {
    if (!mainWindow) throw new Error('Main window not available');
    
    // Print silently using the specified printer
    await mainWindow.webContents.print(
      {
        silent: true,
        printBackground: false,
        deviceName: printerName,
      },
      (success, failureReason) => {
        if (!success) {
          console.error('Print failed:', failureReason);
        }
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error printing:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print-thermal-raw', async (_event, { printerName, escposData }: { printerName: string; escposData: Uint8Array }) => {
  try {
    // For raw ESC/POS printing, we'll use a different approach
    // This requires platform-specific implementations or node-printer library
    console.log(`Raw print request for printer: ${printerName}`);
    console.log(`ESC/POS data length: ${escposData.length} bytes`);
    
    // Note: Full ESC/POS support requires additional native modules
    // For now, return success with a message
    return { 
      success: true, 
      message: 'Raw ESC/POS printing requires additional setup. Use HTML print method for now.' 
    };
  } catch (error: any) {
    console.error('Error with raw printing:', error);
    return { success: false, error: error.message };
  }
});

// ─── Google Drive Sync Instance ───
const gdriveSync = new GoogleDriveSync();

// ─── IPC Handlers: Database Management ───

ipcMain.handle('db:get-info', async () => {
  return getDatabaseInfo();
});

ipcMain.handle('db:get-paths', async () => {
  return getAppPaths();
});

ipcMain.handle('db:reset', async () => {
  const success = resetDatabase();
  return { success };
});

ipcMain.handle('db:seed-demo', async () => {
  const success = seedDemoData();
  return { success };
});

ipcMain.handle('db:export', async () => {
  const dbInfo = getDatabaseInfo();
  if (!dbInfo.exists) return { success: false, error: 'Base de données introuvable.' };

  const result = await dialog.showSaveDialog({
    title: 'Exporter la base de données',
    defaultPath: `brocante-backup-${new Date().toISOString().slice(0, 10)}.sqlite`,
    filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
  });

  if (result.canceled || !result.filePath) return { success: false, error: 'Annulé' };

  try {
    fs.copyFileSync(dbInfo.path, result.filePath);
    return { success: true, path: result.filePath };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('db:import', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Importer une base de données',
    filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return { success: false, error: 'Annulé' };

  const success = importDatabase(result.filePaths[0]);
  return { success };
});

// ─── IPC Handlers: Google Drive Sync ───

ipcMain.handle('gdrive:configure', async (_event, { clientId, clientSecret }: { clientId: string; clientSecret: string }) => {
  gdriveSync.configure(clientId, clientSecret);
  return { success: true };
});

ipcMain.handle('gdrive:auth', async () => {
  try {
    const success = await gdriveSync.authenticate();
    return { success };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('gdrive:upload', async () => {
  try {
    const dbInfo = getDatabaseInfo();
    if (!dbInfo.exists) return { success: false, error: 'Base de données introuvable.' };
    const result = await gdriveSync.uploadBackup(dbInfo.path);
    return result;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('gdrive:list-backups', async () => {
  try {
    const files = await gdriveSync.listBackups();
    return { success: true, files };
  } catch (e: any) {
    return { success: false, error: e.message, files: [] };
  }
});

ipcMain.handle('gdrive:download', async (_event, { fileId }: { fileId: string }) => {
  try {
    const dbInfo = getDatabaseInfo();
    const success = await gdriveSync.downloadBackup(fileId, dbInfo.path);
    return { success };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('gdrive:delete-backup', async (_event, { fileId }: { fileId: string }) => {
  try {
    await gdriveSync.deleteBackup(fileId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('gdrive:set-auto-sync', async (_event, { enabled, interval }: { enabled: boolean; interval?: number }) => {
  gdriveSync.setAutoSync(enabled, interval);
  return { success: true };
});

ipcMain.handle('gdrive:disconnect', async () => {
  gdriveSync.disconnect();
  return { success: true };
});

ipcMain.handle('gdrive:status', async () => {
  return gdriveSync.getStatus();
});

// ─── IPC Handlers: Local Backups ───

ipcMain.handle('backup:list', async () => {
  return listBackups();
});

ipcMain.handle('backup:restore', async (_event, { filename }: { filename: string }) => {
  return restoreBackup(filename);
});

ipcMain.handle('backup:create-now', async () => {
  return createBackup();
});

// ─── IPC Handlers: Auto-Updater ───

ipcMain.handle('updater:check', async () => {
  checkForUpdates();
  return { success: true };
});

ipcMain.handle('updater:install', async () => {
  installUpdate();
  return { success: true };
});

// Cleanup to prevent memory leaks
app.on('before-quit', () => {
  stopPhpServer();
  gdriveSync.stopAutoSync();
  stopDailyBackup();
  stopAutoUpdater();
  mainWindow?.removeAllListeners();
  ipcMain.removeAllListeners();
});

app.on('will-quit', () => {
  stopPhpServer();
});