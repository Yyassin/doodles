import React, { useRef } from 'react';
import Canvas from '@/components/lib/Canvas';
import DropDownMenu from '@/components/lib/DropDownMenu';
import ToolBar from '@/components/lib/ToolBar';
import { useAppStore } from '@/stores/AppStore';
import FullScreenButton from '@/components/lib/FullScreenButton';
import UndoRedoButtons from '@/components/lib/UndoRedoButtons';
import ZoomButtons from '@/components/lib/ZoomButtons';
import CustomToolbar from '@/components/lib/CustomizabilityToolbar';
import { useCanvasElementStore } from '@/stores/CanvasElementsStore';
import ContextMenu from '@/components/lib/ContextMenu';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import ShareScreen from '@/components/lib/ShareScreen';
import ShareScreenButton from '@/components/lib/ShareScreenButton';
import TransparencyButton from '@/components/lib/TransparencyButton';
import { IS_ELECTRON_INSTANCE } from '@/constants';

/**
 * Primary viewport that houses the canvas
 * and accompanying widgets/buttons that lie
 * on top of it (absolutely positioned).
 * @authors Yousef Yassin
 */
const Viewport = () => {
  const { setMode, isTransparent } = useAppStore(['setMode', 'isTransparent']);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { selectedElementIds } = useCanvasElementStore(['selectedElementIds']);

  return (
    <RadixContextMenu.Root>
      <div
        id="Viewport"
        className="select-none"
        ref={viewportRef}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <ToolBar />
        {/* Only show the toolbar is an element is selected */}
        {selectedElementIds.length === 1 && <CustomToolbar />}
        <DropDownMenu viewportRef={viewportRef} />

        <div
          className="flex gap-[0.5rem]"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
          }}
        >
          <ZoomButtons />
          <UndoRedoButtons />
          <FullScreenButton viewportRef={viewportRef} />
          <ShareScreenButton />
          {IS_ELECTRON_INSTANCE && <TransparencyButton />}
        </div>

        {/* Temp */}
        <button
          style={{
            position: 'absolute',
            left: '1rem',
            top: `calc(1rem + ${
              IS_ELECTRON_INSTANCE && isTransparent ? '30px' : '0px'
            })`,
          }}
          onClick={() => setMode('dashboard')}
        >
          Dashboard
        </button>
        <RadixContextMenu.Trigger>
          <ShareScreen />
          <Canvas />
        </RadixContextMenu.Trigger>
      </div>
      <ContextMenu />
    </RadixContextMenu.Root>
  );
};

export default Viewport;
