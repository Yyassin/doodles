import Canvas from '@/components/lib/Canvas';
import DropDownMenu from '@/components/lib/DropDownMenu';
import ToolBar from '@/components/lib/ToolBar';
import { useAppStore } from '@/stores/AppStore';
import React from 'react';

/**
 * Primary viewport that houses the canvas
 * and accompanying widgets/buttons that lie
 * on top of it (absolutely positioned).
 * @authors Yousef Yassin
 */

const Viewport = () => {
  const { setMode } = useAppStore(['setMode']);

  return (
    <div>
      <ToolBar />
      <DropDownMenu />
      {/* Temp */}
      <button
        style={{
          position: 'absolute',
          left: 10,
          top: 10,
        }}
        onClick={() => setMode('dashboard')}
      >
        Dashboard
      </button>
      <Canvas />
    </div>
  );
};

export default Viewport;
