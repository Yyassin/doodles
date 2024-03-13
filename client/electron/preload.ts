import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { IPC_ACTIONS } from './ipc/ipcActions';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Initializes Electron IPC handlers and utility functions for renderer process.
 * @author Yousef Yassin / Template (https://github.com/maxstue/vite-reactts-electron-starter)
 */

/**
 * Promises that resolves when the DOM is in the specified ready state.
 * @param condition Array of DocumentReadyState values to wait for.
 * @returns Promise<boolean>, Resolves to true when the ready state is met.
 */
const domReady = (
  condition: DocumentReadyState[] = ['complete', 'interactive'],
) => {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
};

/**
 * Provides safe DOM manipulation methods for appending and removing elements.
 * @namespace
 * @property append Safely appends a child element to a parent.
 * @property remove Safely removes a child element from a parent.
 */
const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      parent.removeChild(child);
    }
  },
};

/**
 * Loader Splash Screen (Temporary)
 */
/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  -webkit-app-region: drag;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #818cf8;
  z-index: 9;
}
    `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    /**
     * Appends loading spinner elements to the DOM.
     */
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    /**
     * Removes loading spinner elements from the DOM.
     */
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

/**
 * Listens for window messages to remove the loading spinner.
 * @param ev The window message event.
 */
window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading();
};
// Wait for 5 seconds, maximum.
setTimeout(removeLoading, 4999);

// Injects renderer.js into the web page after DOM content is loaded.
// This is used to bridge the browser's media capture to Electron's desktopCapturer.
window.addEventListener('DOMContentLoaded', () => {
  const rendererScript = document.createElement('script');
  rendererScript.text = readFileSync(
    path.join(__dirname, '../electron/renderer.js'),
    'utf8',
  );
  document.body.appendChild(rendererScript);
});

/**
 * Expose Electron IPC API to the renderer process; this allows
 * us to call these methods from the browser without importing
 * Electron (which is blocked). We also expose the electron API types.
 */
contextBridge.exposeInMainWorld(
  'ipcAPI',
  Object.values(IPC_ACTIONS).reduce(
    (acc, value) => {
      /**
       * Sends an IPC message to the main process.
       * @param args Arguments to be sent with the IPC message.
       */
      acc[value] = (...args: unknown[]) => ipcRenderer.send(value, ...args);
      return acc;
    },
    {
      /**
       * Expose the electron API to receive messages from the main process.
       * This is a workaround for dynamic import.
       */
      electron: electronAPI,
      /**
       * Invokes the 'get-sources' IPC event to fetch media sources.
       * @returns A promise that resolves with the fetched sources.
       */
      getSources: () => ipcRenderer.invoke('get-sources'),
    },
  ),
);
