import React from 'react';
import { Sidebar } from '@/components/lib/Sidebar';
import { Board } from '@/components/lib/Board';

export default function Dashboard() {
  const folders = ['Math', 'Science', 'Stats'];
  folders.unshift('Recent');

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar folders={folders} />
      <Board />
    </div>
  );
}
