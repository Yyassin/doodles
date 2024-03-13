import React, { useEffect } from 'react';
import './App.css';
import Bootstrap from './Bootstrap';
import Titlebar from './components/lib/Titlebar/Titlebar';
import { IS_ELECTRON_INSTANCE } from './constants';
import { useAppStore } from './stores/AppStore';
import { useElectronIPCStore } from './stores/ElectronIPCStore';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const { isTransparent } = useAppStore(['isTransparent']);
  const { isWindowActive } = useElectronIPCStore(['isWindowActive']);

  // Set root height to 100%
  useEffect(() => {
    const root = document.getElementById('root');
    const radixThemes = document.getElementsByClassName(
      'radix-themes',
    )[0] as HTMLElement;
    root && (root.style.height = '100%');
    radixThemes && (radixThemes.style.height = '100%');
  }, []);

  return (
    <div
      style={{
        overflow: 'hidden',
        backgroundColor: 'transparent',
        height: '100%',
        // Add border when transparent
        ...(isTransparent && {
          boxShadow: `0px 0px 0px 2px rgba(129, 140, 248, ${
            isWindowActive ? 0.8 : 0.5
          }) inset`,
        }),
      }}
    >
      {IS_ELECTRON_INSTANCE && <Titlebar fg={'#000'} title={'Doodles'} />}
      <div className={`overflow-auto h-full ${!isTransparent && 'bg-white'}`}>
        <Bootstrap />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
