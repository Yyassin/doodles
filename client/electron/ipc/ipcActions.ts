/**
 * Defines the action handles that can be sent to the main process from the renderer process via IPC.
 */
export const IPC_ACTIONS = {
  MAXIMIZE_WINDOW: 'maximize',
  UNMAXIMIZE_WINDOW: 'unmaximize',
  MINIMIZE_WINDOW: 'minimize',
  CLOSE_WINDOW: 'close',
  HANDLE_NOTIFICATION: 'notification',
};
