const { ipcAPI } = window;
const ipcRenderer = ipcAPI?.electron?.ipcRenderer;
console.log('ipcAPI', ipcAPI);
export { ipcAPI, ipcRenderer };
