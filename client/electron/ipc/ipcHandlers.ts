import { BrowserWindow, IpcMainEvent, ipcMain } from 'electron';
import { IPC_ACTIONS } from './ipcActions';
import { notification } from '../main';

const {
  MAXIMIZE_WINDOW,
  UNMAXIMIZE_WINDOW,
  MINIMIZE_WINDOW,
  CLOSE_WINDOW,
  HANDLE_NOTIFICATION,
} = IPC_ACTIONS;

/**
 * Defines Electron IPC handlers and utility functions for window management.
 * @author Yousef Yassin
 */

/**
 * Shared state object for storing global flags and variables.
 * @property global_RecvMaximizedEventFlag Flag to track the reception of maximize events.
 */
export const shared = { global_RecvMaximizedEventFlag: false };

/**
 * Retrieves the BrowserWindow associated with the given IPC event.
 * @param event The IPC event.
 * @returns The associated BrowserWindow or null if not found.
 */
const getWindow = (event: IpcMainEvent) => {
  const webContents = event?.sender;
  return BrowserWindow.fromWebContents(webContents);
};

/**
 * Handles title bar events such as maximizing, unmaximizing, minimizing, and closing the window.
 * @param event The IPC event.
 * @param type The type of title bar event.
 */
const handleWindowTitlebarEvent = (event: IpcMainEvent, type: string) => {
  if (type === MAXIMIZE_WINDOW) {
    shared.global_RecvMaximizedEventFlag = true;
  }
  const window = getWindow(event);
  // The type for title bar events is the same as the method name
  window?.[type]();
  if (type === CLOSE_WINDOW) {
    window?.destroy();
  }
};

/**
 * Handles notification events by updating notification properties and showing the notification.
 * @param _event The IPC event.
 * @param params Notification parameters.
 * @param params.title The title of the notification.
 * @param params.body The body/content of the notification.
 */
const handleNotification = (
  _event: IpcMainEvent,
  { title, body }: { title: string; body: string },
) => {
  notification.title = title;
  notification.body = body;
  notification.show();
};

/**
 * Mapping of IPC events to their corresponding callback functions.
 */
const eventToCallback = {
  [MAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [UNMAXIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [MINIMIZE_WINDOW]: handleWindowTitlebarEvent,
  [CLOSE_WINDOW]: handleWindowTitlebarEvent,
  [HANDLE_NOTIFICATION]: handleNotification,
};

/**
 * Registers IPC event handlers (on the main process)
 * based on the defined mappings.
 */
export const registerIPCHandlers = () => {
  Object.entries(eventToCallback).forEach(([event, callback]) =>
    ipcMain.on(event, callback),
  );
};
