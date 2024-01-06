import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
} from 'electron';
import isDev from 'electron-is-dev';
import path from 'node:path';
import { registerIPCHandlers } from './ipc/ipcHandlers';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist');
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
let tray: Tray | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC ?? './', 'doodles-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
    frame: false,
    title: 'Doodles',
    backgroundColor: '#000',
  });
  tray = new Tray(path.join(process.env.PUBLIC ?? './', 'doodles-icon.png'));
  tray.setIgnoreDoubleClickEvents(true);
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        win && win.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.on('click', () => {
    if (win === null) return;
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  tray.setContextMenu(trayMenu);
  tray.setToolTip('Doodles');

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });
  win.on('maximize', () => {
    win && win.webContents.send('maximized');
  });

  win.on('unmaximize', () => {
    win && win.webContents.send('unmaximized');
  });
  win.on('closed', () => (win = null));

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST ?? './', 'index.html'));
  }
  globalShortcut.register('Alt+1', () => {
    if (isDev) {
      win && win.webContents.openDevTools({ mode: 'detach' });
    }
  });
}

app.on('window-all-closed', () => {
  win = null;
  app.quit();
});

// Titlebar
app.on('browser-window-focus', () => {
  win && win.webContents.send('focused');
});
app.on('browser-window-blur', () => {
  win && win.webContents.send('blurred');
});

ipcMain.handle('close-event', (e) => {
  e.preventDefault();
  win && win.hide();
  e.returnValue = false;
});

app.whenReady().then(() => {
  registerIPCHandlers();
  createWindow();
});
