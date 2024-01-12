import React from 'react';
import { useState } from 'react';
import CanvasTooltip from './CanvasTooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, useWebSocketStore } from '@/stores/WebSocketStore';

const UserList = ({ users }: { users: User[] }) => {
  const { activeTenants } = useWebSocketStore(['activeTenants']);
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
            content={user.username}
            side="bottom"
            sideOffset={5}
          >
            <Avatar
              className={`cursor-pointer ${
                focusedIndex === index ? 'transform scale-125' : ''
              } ${
                user.outlineColor ? `border-[0.2rem] ${user.outlineColor}` : ''
              }`}
              onMouseEnter={() => handleAvatarHover(index)}
              onMouseLeave={handleAvatarLeave}
            >
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </CanvasTooltip>
        </div>
      ))}
    </div>
  );
};

export default UserList;
