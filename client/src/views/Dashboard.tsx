import React from 'react';
import { Sidebar } from '@/components/lib/Sidebar';
import { Board } from '@/components/lib/Board';

const folders = ['Recent', 'Math', 'Science', 'Stats'];
export default function Dashboard() {
  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar folders={folders} />
      <Board />
    </div>
  );
}
