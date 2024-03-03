import React from 'react';
import { useState } from 'react';
import CanvasTooltip from '../CanvasTooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { useWebSocketStore } from '@/stores/WebSocketStore';
import './UserList.css';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';
import { extractCollabID } from '@/lib/misc';

/**
 * Renders a list of users in the room, with their avatars,
 * and their names as tooltips (and whether they are sharing their screen).
 * @author Yousef Yassin
 */

const UserList = () => {
  const { boardMeta } = useCanvasBoardStore(['boardMeta']);
  const { activeTenants, activeProducerID } = useWebSocketStore([
    'activeTenants',
    'activeProducerID',
  ]);
  /* Index of the avatar being hovered for styling. */
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const handleAvatarHover = (index: number) => {
    setFocusedIndex(index);
  };
  const handleAvatarLeave = () => {
    setFocusedIndex(null);
  };

  return (
    <div className="flex items-center">
      {Object.values(activeTenants).map((user, index) => (
        <div
          key={index}
          /**
           * Translate away from the focused avatar, if any.
           */
          className={`relative transition-transform transform ${
            focusedIndex !== null && focusedIndex !== index
              ? index > focusedIndex
                ? 'translate-x-6 -ml-3'
                : '-translate-x-6 -ml-3'
              : '-ml-3'
          } `}
        >
          <CanvasTooltip
            className="radix-themes-custom-fonts"
            content={`${user.username} ${
              activeProducerID === user.email ? ' (Sharing Screen)' : ''
            }`}
            side="bottom"
            sideOffset={5}
          >
            {/* Add a blinking animation to the streamer, if any. */}
            <Avatar
              className={`cursor-pointer ${
                focusedIndex === index ? 'transform scale-125' : ''
              } ${
                user.outlineColor ? `border-[0.2rem] ${user.outlineColor}` : ''
              } ${
                user.email === activeProducerID ? 'blink-active-producer' : ''
              }`}
              onMouseEnter={() => handleAvatarHover(index)}
              onMouseLeave={handleAvatarLeave}
              style={{
                border:
                  user.email === activeProducerID
                    ? ''
                    : `0.2rem solid ${user.outlineColor ?? 'white'}`,
              }}
            >
              <AvatarImage
                src={
                  boardMeta.collaboratorAvatars[
                    extractCollabID(user.email) ?? ''
                  ] ?? ''
                }
              />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </CanvasTooltip>
        </div>
      ))}
    </div>
  );
};

export default UserList;
