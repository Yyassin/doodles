import { extractCollabID, extractUsername } from '@/lib/misc';
import { idToColour } from '@/lib/userColours';
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
  return (
    <svg
      className="h-[100vh] w-[100vw]"
      style={{
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      <g>
        {Object.entries(cursorPositions).map(
          ([userId, position]) =>
            position.x !== null &&
            position.y !== null && (
              <Cursor
                key={userId}
                userId={userId}
                x={position.x}
                y={position.y}
              />
            ),
        )}
      </g>
    </svg>
  );
});

CursorPresence.displayName = 'CursorPresence';
export default CursorPresence;
