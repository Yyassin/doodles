import { BrowserWindow, Menu, Tray, globalShortcut } from 'electron';
import { shared } from './ipc/ipcHandlers';
import path from 'node:path';
import isDev from 'electron-is-dev';

/**
 * @file Utility functions for setting up Electron window, global shortcuts, and tray.
 * @author Yousef Yassin
 */

/**
 * Sets up the main Electron window with specified size and loads the renderer application URL.
 * @param win The main Electron window to set.
 * @param devServer The development server URL (empty string if not in development mode).
 */
export const setupWindow = (win: BrowserWindow, devServer: string) => {
  win.setSize(1000, 800);
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
  // Unmaximize the window when it is moved, but ignore
  // the event that is sent when the window is maximized (because
  // that also triggers a move).
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

  if (devServer) {
    win.loadURL(devServer);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST ?? './', 'index.html'));
  }
};

// Flag to toggle click-through and always-on-top modes
let isClickThrough = false;
/**
 * Registers global shortcuts for the main window, including DevTools and click-through mode toggling.
 * @param win The main Electron window.
 */
export const registerGlobalShortcuts = (win: BrowserWindow) => {
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
};

/**
 * Sets up the Electron tray with a context menu and tooltip for the application.
 * @param win The main Electron window.
 * @param tray The Electron tray instance.
 * @param appName The name of the application.
 */
export const setupTray = (win: BrowserWindow, tray: Tray, appName: string) => {
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
  tray.setToolTip(appName);
};
