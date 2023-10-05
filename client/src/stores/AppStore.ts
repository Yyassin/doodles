import { create } from 'zustand';
import { AppMode, AppTheme } from '@/types';
import { SetState } from './types';
import { createStoreWithSelectors } from './utils';

/**
 * Defines global app state, and reducer.
 * Pattern Reference: https://dev.to/eraywebdev/optimizing-zustand-how-to-prevent-unnecessary-re-renders-in-your-react-app-59do
 * @authors Yousef Yassin
 */

/** Definitions */
interface AppState {
  // The current app mode (selected tool or action)
  mode: AppMode;
  // The current app theme
  theme: AppTheme;
}
interface AppActions {
  // Reducer to set the app mode
  setMode: (mode: AppMode) => void;
  setTheme: (theme: AppTheme) => void;
}
type AppStore = AppState & AppActions;

// Initialize App State to default state.
export const initialAppState: AppState = {
  mode: 'select',
  theme: 'dark',
};

/** Actions / Reducers */
const setMode = (set: SetState<AppStore>) => (mode: AppMode) =>
  set(() => ({ mode }));
const setTheme = (set: SetState<AppStore>) => (theme: AppTheme) =>
  set(() => ({ theme }));

/** Store Hook */
const appStore = create<AppStore>()((set) => ({
  ...initialAppState,
  setMode: setMode(set),
  setTheme: setTheme(set),
}));
export const useAppStore = createStoreWithSelectors(appStore);
