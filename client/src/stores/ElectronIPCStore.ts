import { create } from 'zustand';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/** Definitions */
interface ElectronIPCState {
  isWindowActive: boolean;
  isWindowMaximized: boolean;
  isWindowClickThrough: boolean;
  windowBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ElectronIPCActions {
  setIsWindowActive: (isWindowActive: boolean) => void;
  setIsWindowMaximized: (isWindowMaximized: boolean) => void;
  setIsWindowClickThrough: (isWindowClickThrough: boolean) => void;
  setWindowBounds: (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
}

type ElectronIPCStore = ElectronIPCActions & ElectronIPCState;

// Initialize Auth State to default state.
export const initialElectronIPCState: ElectronIPCState = {
  isWindowActive: false,
  isWindowMaximized: false,
  isWindowClickThrough: false,
  windowBounds: {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
  },
};

/** Actions / Reducers */
const setIsWindowActive =
  (set: SetState<ElectronIPCStore>) => (isWindowActive: boolean) =>
    set(() => ({ isWindowActive }));
const setIsWindowMaximized =
  (set: SetState<ElectronIPCStore>) => (isWindowMaximized: boolean) =>
    set(() => ({ isWindowMaximized }));
const setIsWindowClickThrough =
  (set: SetState<ElectronIPCStore>) => (isWindowClickThrough: boolean) =>
    set(() => ({ isWindowClickThrough }));
const setWindowBounds =
  (set: SetState<ElectronIPCStore>) =>
  (x: number, y: number, width: number, height: number) =>
    set(() => ({ windowBounds: { x, y, width, height } }));

/** Store Hook */
const ElectronIPCStore = create<ElectronIPCStore>()((set) => ({
  ...initialElectronIPCState,
  setIsWindowActive: setIsWindowActive(set),
  setIsWindowMaximized: setIsWindowMaximized(set),
  setIsWindowClickThrough: setIsWindowClickThrough(set),
  setWindowBounds: setWindowBounds(set),
}));
export const useElectronIPCStore = createStoreWithSelectors(ElectronIPCStore);
