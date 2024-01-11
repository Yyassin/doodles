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
  // Whether in an RTC call or not.
  isInCall: boolean;
  // Viewport width
  appWidth: number;
  // Viewport Height
  appHeight: number;
  // Canvas Zoom
  zoom: number;
  //Panning offset
  panOffset: { x: number; y: number };
  // Canvas Background Color
  canvasColor: string;
  // Whether app is in transparent canvas mode.
  isTransparent: boolean;
  isUsingStableDiffusion: boolean;
  isViewingComments: boolean;
}
/** Reducers */
interface AppActions {
  setAction: (action: Action) => void;
  setMode: (mode: AppMode) => void;
  setTool: (tool: AppTool) => void;
  setTheme: (theme: AppTheme) => void;
  setAppDimensions: (width: number, height: number) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setAppZoom: (zoom: number) => void;
  setPanOffset: (x: number, y: number) => void;
  setIsSharingScreen: (isShareScreen: boolean) => void;
  setIsInCall: (isInCall: boolean) => void;
  setCanvasBackground: (canvasColor: string) => void;
  setIsTransparent: (isTransparent: boolean) => void;
  setIsUsingStableDiffusion: (isUsingStableDiffusion: boolean) => void;
  setIsViewingComments: (isViewingComments: boolean) => void;
}
type AppStore = AppState & AppActions;

// Initialize App State to default state.
export const initialAppState: AppState = {
  action: 'none',
  mode: 'signin',
  tool: 'select',
  theme: 'dark',
  isFullscreen: false,
  isSharingScreen: false,
  isInCall: false,
  appWidth: window.innerWidth,
  appHeight: window.innerHeight,
  zoom: 1, // 100%
  panOffset: { x: 0, y: 0 },
  canvasColor: '#fff',
  isTransparent: false,
  isUsingStableDiffusion: false,
  isViewingComments: false,
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
const setIsTransparent =
  (set: SetState<AppStore>) => (isTransparent: boolean) =>
    set(() => ({ isTransparent }));
// Zoom and Panning are disabled in transparent mode.
const setAppZoom = (set: SetState<AppStore>) => (zoom: number) =>
  set((state) =>
    state.isTransparent
      ? state
      : {
          ...state,
          zoom,
        },
  );
const setPanOffset = (set: SetState<AppStore>) => (x: number, y: number) =>
  set((state) =>
    state.isTransparent ? state : { ...state, panOffset: { x, y } },
  );
const setCanvasBackground =
  (set: SetState<AppStore>) => (canvasColor: string) =>
    set(() => ({ canvasColor }));
const setIsUsingStableDiffusion =
  (set: SetState<AppStore>) => (isUsingStableDiffusion: boolean) =>
    set(() => ({ isUsingStableDiffusion }));
const setIsViewingComments =
  (set: SetState<AppStore>) => (isViewingComments: boolean) =>
    set(() => ({ isViewingComments }));

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
  setCanvasBackground: setCanvasBackground(set),
  setIsTransparent: setIsTransparent(set),
  setIsUsingStableDiffusion: setIsUsingStableDiffusion(set),
  setIsViewingComments: setIsViewingComments(set),
}));
export const useAppStore = createStoreWithSelectors(appStore);
