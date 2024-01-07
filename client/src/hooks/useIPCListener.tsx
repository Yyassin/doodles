import { ipcRenderer } from '@/data/ipc/ipcMessages';
import { useElectronIPCStore } from '@/stores/ElectronIPCStore';
import { useEffect } from 'react';

const useIPCListener = () => {
  const {
    setIsWindowActive,
    setIsWindowMaximized,
    setIsWindowClickThrough,
    setWindowBounds,
  } = useElectronIPCStore([
    'setIsWindowActive',
    'setIsWindowMaximized',
    'setIsWindowClickThrough',
    'setWindowBounds',
  ]);
  useEffect(() => {
    const listeners = {
      focused: () => setIsWindowActive(true),
      blurred: () => setIsWindowActive(false),
      maximized: () => setIsWindowMaximized(true),
      unmaximized: () => setIsWindowMaximized(false),
      ['bounds-changed']: (
        _event: unknown,
        { x, y, height, width }: Electron.Rectangle,
      ) => setWindowBounds(x, y, width, height),
      ['click-through']: (_event: unknown, clickThrough: boolean) =>
        setIsWindowClickThrough(clickThrough),
    };
    Object.entries(listeners).forEach(([handle, callback]) =>
      ipcRenderer.on(handle, callback),
    );
    return () => {
      Object.keys(listeners).forEach((handle) =>
        ipcRenderer.removeAllListeners(handle),
      );
    };
  }, []);
};

export default useIPCListener;
