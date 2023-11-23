import { create } from 'zustand';
import { AppMode, AppTool, AppTheme } from '@/types';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Defines global app state, and reducer.
 * Pattern Reference: https://dev.to/eraywebdev/optimizing-zustand-how-to-prevent-unnecessary-re-renders-in-your-react-app-59do
 * @authors Yousef Yassin
 */

/** Definitions */
interface AppState {
  // The current app mode (the selected page)
  mode: AppMode;
  // The current app tool (selected tool or action)
  tool: AppTool;
  // The current app theme
  theme: AppTheme;
  // Whether app is fullscreen or not
  isFullscreen: boolean;
  // Viewport width
  appWidth: number;
  // Viewport Height
  appHeight: number;
}
interface AppActions {
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
}
type AppStore = AppState & AppActions;

// Initialize App State to default state.
export const initialAppState: AppState = {
  mode: 'signin',
  tool: 'line',
  theme: 'dark',
  isFullscreen: false,
  appWidth: window.innerWidth,
  appHeight: window.innerHeight,
};

/** Actions / Reducers */
// TODO(yousef): Abstract singleton setters
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

/** Store Hook */
const appStore = create<AppStore>()((set) => ({
  ...initialAppState,
  setTool: setTool(set),
  setMode: setMode(set),
  setTheme: setTheme(set),
  setIsFullscreen: setIsFullscreen(set),
  setAppDimensions: setAppDimensions(set),
}));
export const useAppStore = createStoreWithSelectors(appStore);
