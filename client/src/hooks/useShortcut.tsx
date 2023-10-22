import { useAppStore } from '@/stores/AppStore';
import { AppTool, AppTools } from '@/types';
import { useEffect } from 'react';

/**
 * Defines a hook that listen for shortcuts
 * and fires corresponding actions.
 * @author Yousef Yassin
 */

/**
 * Ignore repeat events (key held down), and
 * content editable / input field changes.
 */
const shouldIgnoreKeyPress = (e: KeyboardEvent) => {
  return (
    e.repeat ||
    (e.target as HTMLElement)?.isContentEditable ||
    ['INPUT', 'TEXTAREA'].includes(
      (e.target as HTMLElement)?.tagName.toUpperCase(),
    )
  );
};

/**
 * Define a map from keypress digit
 * to corresponding tool for selection.
 */
const toolShortcutMap: Record<string, AppTool> = {};
let toolShortcut = 1;
AppTools.forEach((section) => {
  const numericKeyInput = 'Digit' + toolShortcut;
  toolShortcutMap[numericKeyInput] = section;
  toolShortcut++;
});

export const useShortcuts = () => {
  const { setTool } = useAppStore(['setTool']);
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyPress(e)) return;

      const toolSelected = toolShortcutMap[e.code];
      if (toolSelected !== undefined) {
        setTool(toolSelected);
      }
    };

    window.addEventListener('keypress', onKeyPress);
    // Cleanup
    return () => {
      window.removeEventListener('keypress', onKeyPress);
    };
  });
};
