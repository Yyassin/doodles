/**
 * Common type definitions used across the application
 * @authors Yousef Yassin
 */

/** App */
/* Supported application modes, these are tools and actions the user may use. */
export const AppModes = ['select', 'pan'] as const;
export type AppMode = (typeof AppModes)[number];

/** Suppored application themes, these change the app's global appearance. */
export const AppThemes = ['light', 'dark'] as const;
export type AppTheme = (typeof AppThemes)[number];
