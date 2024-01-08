import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  // Electron APIs injected in preload.ts
  interface Window {
    ipcAPI: Record<string, (...args: unknown[]) => unknown> & {
      electron: ElectronAPI;
    };
  }
}
