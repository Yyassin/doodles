import { getScaleOffset } from '@/lib/canvasElements/render';
import { extractCollabID, extractUsername } from '@/lib/misc';
import { idToColour } from '@/lib/userColours';
import { useAppStore } from '@/stores/AppStore';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import { Vector2 } from '@/types';
import { MousePointer2 } from 'lucide-react';
import React, { memo, useMemo } from 'react';

const Cursor = memo(({ userId, x, y }: Vector2 & { userId: string }) => {
  const { userName, cursorColour } = useMemo(
    () => ({
      userName: extractUsername(userId) ?? userId,
      cursorColour: idToColour(extractCollabID(userId) ?? userId),
    }),
    [userId],
  );
  return (
    <foreignObject
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      height={50}
      width={userName.length * 10 + 24}
      className="relative drop-shadow-md"
    >
      <MousePointer2
        className="h-5 w-5"
        style={{
          fill: cursorColour,
          color: cursorColour,
        }}
      />
      <div
        className="absolute left-5 px-1.5 py-0.5 rounded-md text-xs text-white font-semibold"
        style={{ backgroundColor: cursorColour }}
      >
        {userName}
      </div>
    </foreignObject>
  );
});
Cursor.displayName = 'CursorPresence';

const CursorPresence = memo(() => {
  const { cursorPositions } = useWebSocketStore(['cursorPositions']);
  const { panOffset, zoom, appHeight, appWidth } = useAppStore([
    'panOffset',
    'zoom',
    'appHeight',
    'appWidth',
  ]);
  return (
    <svg
      className="h-[100vh] w-[100vw]"
      style={{
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 9,
        pointerEvents: 'none',
      }}
    >
      <g>
        {Object.entries(cursorPositions).map(([userId, position]) => {
          if (position.x === null || position.y === null) return;
          // Cursor Positions are in the absolute frame, but we send everything
          // in the canvas relative frame (since the other clients may have
          // a different zoom, and offset. So inverse the transformation
          // according to the current zoom and panOffset for *our* client)
          const scaleOffset = getScaleOffset(appHeight, appWidth, zoom);
          const posX = position.x * zoom - scaleOffset.x + panOffset.x * zoom;
          const posY = position.y * zoom - scaleOffset.y + panOffset.y * zoom;
          return <Cursor key={userId} userId={userId} x={posX} y={posY} />;
        })}
      </g>
    </svg>
  );
});

CursorPresence.displayName = 'CursorPresence';
export default CursorPresence;
