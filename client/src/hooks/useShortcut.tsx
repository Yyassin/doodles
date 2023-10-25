import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
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
  const { selectedElementId, setSelectedElement, removeCanvasElement } =
    useCanvasElementStore([
      'selectedElementId',
      'setSelectedElement',
      'removeCanvasElement',
    ]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyPress(e)) return;

      const toolSelected = toolShortcutMap[e.code];
      if (toolSelected !== undefined) {
        setTool(toolSelected);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyPress(e)) return;

      if (e.code === 'Backspace') {
        const id = selectedElementId;
        setSelectedElement('');
        removeCanvasElement(id);
      }
    };

    window.addEventListener('keypress', onKeyPress);
    window.addEventListener('keydown', onKeyDown);
    // Cleanup
    return () => {
      window.removeEventListener('keypress', onKeyPress);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedElementId]);
};
