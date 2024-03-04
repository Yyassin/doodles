import React from 'react';
import { Sidebar } from '@/components/lib/Sidebar';
import { Board } from '@/components/lib/Board';
import { useCanvasBoardStore } from '@/stores/CanavasBoardStore';

export default function Dashboard() {
  const { canvases } = useCanvasBoardStore(['canvases']);

  const userFolders = [
    ...new Set(['Recent', ...canvases.map((board) => board.folder)]),
  ];

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar folders={userFolders} />
      <Board />
    </div>
  );
}
