import React from 'react';
import { useAppStore } from '@/stores/AppStore';

export default function Dashboard() {
  const { setMode } = useAppStore(['setMode']);
  return (
    <div>
      <h1>Dashboard dummy text</h1>
      <button onClick={() => setMode('canvas')}>Canvas</button>
    </div>
  );
}
