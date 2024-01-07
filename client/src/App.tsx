import React, { useEffect } from 'react';
import './App.css';
import Bootstrap from './Bootstrap';
import Titlebar from './components/lib/Titlebar/Titlebar';
import { IS_ELECTRON_INSTANCE } from './constants';
import { useAppStore } from './stores/AppStore';
import { useElectronIPCStore } from './stores/ElectronIPCStore';

function App() {
  const { isTransparent } = useAppStore(['isTransparent']);
  const { isWindowActive } = useElectronIPCStore(['isWindowActive']);
  useEffect(() => {
    const root = document.getElementById('root');
    const radixThemes = document.getElementsByClassName(
      'radix-themes',
    )[0] as HTMLElement;
    if (IS_ELECTRON_INSTANCE && isTransparent) {
      root && (root.style.height = '100%');
      radixThemes && (radixThemes.style.height = '100%');
    } else {
      root && (root.style.height = '');
      radixThemes && (radixThemes.style.height = '100%');
    }
  }, [isTransparent]);
  return (
    <div
      style={{
        backgroundColor: 'transparent',
        ...(isTransparent && {
          height: '100%',
          boxShadow: `0px 0px 0px 2px rgba(129, 140, 248, ${
            isWindowActive ? 0.8 : 0.5
          }) inset`,
        }),
      }}
    >
      {IS_ELECTRON_INSTANCE && <Titlebar fg={'#000'} title={'Doodles'} />}
      <Bootstrap />
    </div>
  );
}

export default App;
