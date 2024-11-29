import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron';
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

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
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

// Cleanup to prevent memory leaks
app.on('before-quit', () => {
  mainWindow?.removeAllListeners();
});