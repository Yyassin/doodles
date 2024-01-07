import { BrowserWindow, IpcMainEvent, ipcMain } from 'electron';
import { IPC_ACTIONS } from './ipcActions';
import { notification } from '../main';

export const shared = { global_RecvMaximizedEventFlag: false };

const {
  MAXIMIZE_WINDOW,
  UNMAXIMIZE_WINDOW,
  MINIMIZE_WINDOW,
  CLOSE_WINDOW,
  HANDLE_NOTIFICATION,
} = IPC_ACTIONS;

const getWindow = (event: IpcMainEvent) => {
  const webContents = event?.sender;
  return BrowserWindow.fromWebContents(webContents);
};

const handleWindowTitlebarEvent = (event: IpcMainEvent, type: string) => {
  if (type === MAXIMIZE_WINDOW) {
    shared.global_RecvMaximizedEventFlag = true;
  }
  const window = getWindow(event);
  console.log(type);
  window?.[type](); // The type for title bar events is the same as the method name
  if (type === CLOSE_WINDOW) {
    window?.destroy();
  }
};

const handleNotification = (
  event: IpcMainEvent,
  { title, body }: { title: string; body: string },
) => {
  notification.title = title;
  notification.body = body;
  notification.show();
};

const eventToCallback = {
  [MAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [UNMAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [MINIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [CLOSE_WINDOW]: handleWindowTitlebarEvent,
  [HANDLE_NOTIFICATION]: handleNotification,
};

export const registerIPCHandlers = () => {
  Object.entries(eventToCallback).forEach(([event, callback]) =>
    ipcMain.on(event, callback),
  );
};
