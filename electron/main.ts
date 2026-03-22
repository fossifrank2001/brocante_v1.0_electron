import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

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
      devTools: isDev,
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
      label: 'Developer Tools',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+I',
          click: () => mainWindow?.webContents.toggleDevTools()
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload'
        },
        {
          label: 'Hard Reload (No Cache)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'API Documentation',
          accelerator: 'CmdOrCtrl+D',
          click: () => mainWindow?.loadURL('http://127.0.0.1:8000/docs/api')
        },
      ]
    },
    {
      label: 'Home',
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
      } finally {
        mainWindow?.webContents.openDevTools();
      }
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
  try {
    await Promise.all([
      installExtension(REDUX_DEVTOOLS),
      installExtension(REACT_DEVELOPER_TOOLS)
    ]);
    console.log('Extensions installed successfully');
  } catch (error) {
    console.error('Failed to install extensions:', error);
  }

  createWindow();
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

// Cleanup to prevent memory leaks
app.on('before-quit', () => {
  mainWindow?.removeAllListeners();
  ipcMain.removeAllListeners();
});