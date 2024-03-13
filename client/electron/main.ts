import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Notification,
  Tray,
} from 'electron';
import path from 'node:path';
import { registerIPCHandlers } from './ipc/ipcHandlers';
import { registerGlobalShortcuts, setupTray, setupWindow } from './window';

/**
 * @file Main Electron process handling application initialization and window creation.
 * This is the entry point for the main process.
 * @author Yousef Yassin
 */

// Set environment variables for the build directory structure
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

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const APP_NAME = 'Doodles';
const iconPath = path.join(process.env.PUBLIC ?? './', 'doodles-icon.png');

// Global variables for notification, main window, and tray. They
// must be global to prevent garbage collection.
export let notification: Notification;
let win: BrowserWindow | null;
let tray: Tray | null;

/**
 * Creates the main application window.
 */
const createWindow = () => {
  win = new BrowserWindow({
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false,
    },
    transparent: true,
    frame: false,
    title: APP_NAME,
    minWidth: 600,
    minHeight: 400,
  });
  setupWindow(win, VITE_DEV_SERVER_URL ?? '');
  win.on('closed', () => (win = null));

  // Setup the tray icon
  tray = new Tray(iconPath);
  setupTray(win, tray, APP_NAME);

  // Setup notification with click handling
  notification = new Notification({ icon: iconPath });
  notification.on('click', () => {
    if (!win?.isVisible() || win?.isMinimized()) {
      win?.show();
    }
  });

  // Register global shortcuts for the main window
  registerGlobalShortcuts(win);
};

// Event handlers for app lifecycle and window focus/blur
app.on('window-all-closed', () => {
  win = null;
});
app.on('browser-window-focus', () => {
  win && win.webContents.send('focused');
});
app.on('browser-window-blur', () => {
  win && win.webContents.send('blurred');
});
// Handle 'close-event' IPC event to hide the window instead of closing
ipcMain.handle('close-event', (e) => {
  e.preventDefault();
  win && win.hide();
  e.returnValue = false;
});

// Application setup when app is ready
app.whenReady().then(() => {
  // Register IPC handlers, create the main window.
  registerIPCHandlers();
  createWindow();
  // Bridge the get-sources IPC event, fired from the renderer process,
  // to the main process. This is necessary because desktopCapturer
  // is only available in the main process.
  ipcMain.handle('get-sources', () => {
    try {
      return desktopCapturer
        .getSources({ types: ['window', 'screen'] })
        .then((sources) =>
          sources.map((source) => ({
            ...source,
            thumbnail: {
              // We need to invoke the thumbnail image methods
              // in the main process since they can't be
              // passed through the context bridge.
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
