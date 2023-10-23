import React from 'react';
import { useAppStore } from '@/stores/AppStore';
import LogoutButton from '../components/lib/LogoutButton';

export default function Dashboard() {
  const { setMode } = useAppStore(['setMode']);

  return (
    <div>
      <h1>Dashboard dummy text</h1>
      <button onClick={() => setMode('canvas')}>Canvas</button>
      <LogoutButton />
    </div>
  );
}
