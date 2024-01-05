import { create } from 'zustand';
import { AppMode, AppTool, AppTheme, Action } from '@/types';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Defines global app state, and reducer.
 * Pattern Reference: https://dev.to/eraywebdev/optimizing-zustand-how-to-prevent-unnecessary-re-renders-in-your-react-app-59do
 * @authors Yousef Yassin
 */

/** Definitions */
interface AppState {
  // Current canvas action
  action: Action;
  // The current app mode (the selected page)
  mode: AppMode;
  // The current app tool (selected tool or action)
  tool: AppTool;
  // The current app theme
  theme: AppTheme;
  // Whether app is fullscreen or not
  isFullscreen: boolean;
  // Whether sharing screen or not
  isSharingScreen: boolean;
  isInCall: boolean;
  // Viewport width
  appWidth: number;
  // Viewport Height
  appHeight: number;
  // Canvas Zoom
  zoom: number;
  //Panning offset
  panOffset: { x: number; y: number };
}
interface AppActions {
  // Reducer to set the canvas action
  setAction: (action: Action) => void;
  // Reducer to set the app mode
  setMode: (mode: AppMode) => void;
  // Reducer to set the app tool
  setTool: (tool: AppTool) => void;
  // Reducer to set the app theme
  setTheme: (theme: AppTheme) => void;
  // Reducer to set app window dimensions
  setAppDimensions: (width: number, height: number) => void;
  // Reducer to set full screen mode
  setIsFullscreen: (isFullscreen: boolean) => void;
  // Reducer to set zoom level
  setAppZoom: (zoom: number) => void;
  setPanOffset: (x: number, y: number) => void;
  setIsSharingScreen: (isShareScreen: boolean) => void;
  setIsInCall: (isInCall: boolean) => void;
}
type AppStore = AppState & AppActions;

// Initialize App State to default state.
export const initialAppState: AppState = {
  action: 'none',
  mode: 'signin',
  tool: 'line',
  theme: 'dark',
  isFullscreen: false,
  isSharingScreen: false,
  isInCall: false,
  appWidth: window.innerWidth,
  appHeight: window.innerHeight,
  zoom: 1, // 100%
  panOffset: { x: 0, y: 0 },
};

/** Actions / Reducers */
// TODO(yousef): Abstract singleton setters
const setAction = (set: SetState<AppStore>) => (action: Action) =>
  set(() => ({ action }));
const setTool = (set: SetState<AppStore>) => (tool: AppTool) =>
  set(() => ({ tool }));
const setMode = (set: SetState<AppStore>) => (mode: AppMode) =>
  set(() => ({ mode }));
const setTheme = (set: SetState<AppStore>) => (theme: AppTheme) =>
  set(() => ({ theme }));
const setAppDimensions =
  (set: SetState<AppStore>) => (width: number, height: number) =>
    set(() => ({ appWidth: width, appHeight: height }));
const setIsFullscreen = (set: SetState<AppStore>) => (isFullscreen: boolean) =>
  set(() => ({ isFullscreen }));
const setIsSharingScreen =
  (set: SetState<AppStore>) => (isSharingScreen: boolean) =>
    set(() => ({ isSharingScreen }));
const setIsInCall = (set: SetState<AppStore>) => (isInCall: boolean) =>
  set(() => ({ isInCall }));
const setAppZoom = (set: SetState<AppStore>) => (zoom: number) =>
  set(() => ({
    zoom,
  }));
const setPanOffset = (set: SetState<AppStore>) => (x: number, y: number) =>
  set(() => ({ panOffset: { x, y } }));

/** Store Hook */
const appStore = create<AppStore>()((set) => ({
  ...initialAppState,
  setAction: setAction(set),
  setTool: setTool(set),
  setMode: setMode(set),
  setTheme: setTheme(set),
  setIsFullscreen: setIsFullscreen(set),
  setIsSharingScreen: setIsSharingScreen(set),
  setAppDimensions: setAppDimensions(set),
  setAppZoom: setAppZoom(set),
  setPanOffset: setPanOffset(set),
  setIsInCall: setIsInCall(set),
}));
export const useAppStore = createStoreWithSelectors(appStore);
