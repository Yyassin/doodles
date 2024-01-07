import { BrowserWindow, IpcMainEvent, ipcMain } from 'electron';
import { IPC_ACTIONS } from './ipcActions';

const { MAXIMIZE_WINDOW, UNMAXIMIZE_WINDOW, MINIMIZE_WINDOW, CLOSE_WINDOW } =
  IPC_ACTIONS;

const getWindow = (event: IpcMainEvent) => {
  const webContents = event?.sender;
  return BrowserWindow.fromWebContents(webContents);
};

const handleWindowTitlebarEvent = (event: IpcMainEvent, type: string) => {
  const window = getWindow(event);
  console.log(type);
  window?.[type](); // The type for title bar events is the same as the method name
  if (type === CLOSE_WINDOW) {
    window?.destroy();
  }
};

const eventToCallback = {
  [MAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [UNMAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [MINIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [CLOSE_WINDOW]: handleWindowTitlebarEvent,
};

export const registerIPCHandlers = () => {
  Object.entries(eventToCallback).forEach(([event, callback]) =>
    ipcMain.on(event, callback),
  );
};
