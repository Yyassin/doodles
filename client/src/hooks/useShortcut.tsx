import { ZOOM } from '@/constants';
import { clamp } from '@/lib/misc';
import { useAppStore } from '@/stores/AppStore';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { AppTool, AppTools, EVENT } from '@/types';
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
  const { setTool, setAppZoom, zoom, panOffset, setPanOffset } = useAppStore([
    'setTool',
    'setAppZoom',
    'zoom',
    'panOffset',
    'setPanOffset',
  ]);
  const { selectedElementIds, setSelectedElements, removeCanvasElements } =
    useCanvasElementStore([
      'selectedElementIds',
      'setSelectedElements',
      'removeCanvasElements',
    ]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyPress(e)) return;

      // Set the shortcut tool
      const toolSelected = toolShortcutMap[e.code];
      if (toolSelected !== undefined) {
        setTool(toolSelected);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyPress(e)) return;

      // Delete the selected element on backspace
      if (e.code === 'Backspace' && selectedElementIds.length) {
        const ids = selectedElementIds;
        setSelectedElements([]);
        removeCanvasElements(ids);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Zoom event
        setAppZoom(clamp(zoom - e.deltaY * ZOOM.INC * 0.1, ZOOM.MIN, ZOOM.MAX));
        e.preventDefault();
        return false;
      } else {
        //Pan Event
        // Most mice will only support Y scroll. If Alt is pressed, we consider
        // Y delta to be in the X direction to support horizontal scroll.
        const [dx, dy] = e.altKey ? [e.deltaY, e.deltaX] : [e.deltaX, e.deltaY];
        setPanOffset(panOffset.x - dx, panOffset.y - dy);
      }
    };

    window.addEventListener(EVENT.KEYPRESS, onKeyPress);
    window.addEventListener(EVENT.KEYDOWN, onKeyDown);
    window.addEventListener(EVENT.WHEEL, onWheel, { passive: false });
    // Cleanup
    return () => {
      window.removeEventListener(EVENT.KEYPRESS, onKeyPress);
      window.removeEventListener(EVENT.KEYDOWN, onKeyDown);
      window.removeEventListener(EVENT.WHEEL, onWheel);
    };
  }, [selectedElementIds, zoom, panOffset]);
};
