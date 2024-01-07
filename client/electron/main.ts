import {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  Menu,
  Notification,
  Tray,
} from 'electron';
import isDev from 'electron-is-dev';
import path from 'node:path';
import { registerIPCHandlers, shared } from './ipc/ipcHandlers';

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

const iconPath = path.join(process.env.PUBLIC ?? './', 'doodles-icon.png');

let win: BrowserWindow | null;
export let notification: Notification;
let tray: Tray | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let isClickThrough = false;
function createWindow() {
  win = new BrowserWindow({
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
    transparent: true,
    frame: false,
    title: 'Doodles',
  });
  tray = new Tray(iconPath);
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
        win && win.close();
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

  notification = new Notification({ icon: iconPath });
  notification.on('click', () => {
    if (!win?.isVisible() || win?.isMinimized()) {
      win?.show();
    }
  });

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
  win.on('move', () => {
    if (!shared.global_RecvMaximizedEventFlag) {
      win?.unmaximize();
    } else {
      shared.global_RecvMaximizedEventFlag = false;
    }
    win && win.webContents.send('bounds-changed', win.getBounds());
  });
  win.on('resize', () => {
    win && win.webContents.send('unmaximized');
    win && win.webContents.send('bounds-changed', win.getBounds());
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
  globalShortcut.register('Ctrl+T', () => {
    if (isDev) {
      isClickThrough = !isClickThrough;
      win?.setIgnoreMouseEvents(isClickThrough);
      win?.setAlwaysOnTop(isClickThrough);
      win?.webContents.send('click-through', isClickThrough);
    }
  });
}
app.on('window-all-closed', () => {
  win = null;
});

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

  ipcMain.handle('get-sources', () => {
    try {
      return desktopCapturer
        .getSources({ types: ['window', 'screen'] })
        .then((sources) =>
          sources.map((source) => ({
            ...source,
            thumbnail: {
              dataURL: source.thumbnail.toDataURL(),
              aspect: source.thumbnail.getAspectRatio(),
            },
          })),
        );
    } catch (e) {
      return [];
    }
  });
});
