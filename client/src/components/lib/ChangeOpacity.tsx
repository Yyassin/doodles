import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { debounce } from 'lodash';

/**
 * This file defines the OpacitySlider component, which allows the user to adjust
 * the opacity of the selected canvas element. The current opacity value is retrieved
 * from the `opacities` object in the CanvasElementStore, and changes to the opacity
 * are made by calling the `editCanvasElement` function.
 * @author Eebro
 */

const OpacitySlider = () => {
  const {
    editCanvasElement,
    pushCanvasHistory,
    selectedElementIds,
    opacities,
    setToolOptions,
    toolOptions,
  } = useCanvasElementStore([
    'editCanvasElement',
    'pushCanvasHistory',
    'selectedElementIds',
    'opacities',
    'setToolOptions',
    'toolOptions',
  ]);
  const { setWebsocketAction } = useWebSocketStore(['setWebsocketAction']);
  const commitOpacityDebounced = useCallback(
    debounce(() => {
      pushCanvasHistory();
      setWebsocketAction(selectedElementIds[0], 'editCanvasElement');
    }, 500),
    [selectedElementIds],
  );
  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none w-[200px] h-5"
      value={[opacities[selectedElementIds[0]] ?? toolOptions.opacity]}
      onValueChange={(value) => {
        if (selectedElementIds[0]) {
          editCanvasElement(selectedElementIds[0], { opacity: value[0] });
          commitOpacityDebounced();
        } else {
          setToolOptions({ opacity: value[0] });
        }
      }}
      min={0}
      max={1}
      step={0.01}
    >
      <Slider.Track className="bg-black relative grow rounded-full h-[3px]">
        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-4 h-4 bg-white shadow-[0_2px_10px] shadow-blackA4 rounded-[10px]"
        aria-label="Opacity"
      />
    </Slider.Root>
  );
};

export default OpacitySlider;
