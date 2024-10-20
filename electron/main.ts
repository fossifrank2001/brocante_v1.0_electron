import { app, BrowserWindow, Menu } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import installExtension, {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import MenuItemConstructorOptions = Electron.MenuItemConstructorOptions;

const isDev = process.env.NODE_ENV === 'development';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    resizable:true,
    movable:false,
    //alwaysOnTop: true,
    //show:false,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: isDev,
    }
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Developer Tools',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            win?.webContents.toggleDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          role: 'reload'
        },
        {
          label: 'Api Documentation',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            win?.loadURL('http://127.0.0.1:8000/docs/api')
          }
        },
      ]
    },
    {
      label: 'Home',
      accelerator: 'CmdOrCtrl+H',
      click: () => {
        if (win) {
          win.webContents.send('navigate-home');
        }
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.maximize();

  if (isDev) {
    win.webContents.once('dom-ready', async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((error) => console.log('An error occurred: ', error))
        .finally(() => {
          win?.webContents.openDevTools();
        });
    });
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS].map((extension) => {
    installExtension(extension)
      .then((name) => console.log(`Install extension ${name}`))
      .catch((error) => console.log('An error has occured', error));
  });

  createWindow();
});
