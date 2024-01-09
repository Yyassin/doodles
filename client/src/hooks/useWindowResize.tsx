import { IS_ELECTRON_INSTANCE } from '@/constants';
import { useAppStore } from '@/stores/AppStore';
import { EVENT } from '@/types';
import { useEffect } from 'react';

const titleBarOffset = IS_ELECTRON_INSTANCE ? 30 : 0;

/**
 * Hook that's subscribed to resize events to
 * update app dimension state for resize handling.
 * @author Yousef Yassin
 */
const useWindowResize = () => {
  const { setAppDimensions } = useAppStore(['setAppDimensions']);
  const handleResize = () => {
    setAppDimensions(window.innerWidth, window.innerHeight - titleBarOffset);
  };

  useEffect(() => {
    window.addEventListener(EVENT.RESIZE, handleResize);
    handleResize();
    return () => window.removeEventListener(EVENT.RESIZE, handleResize);
  }, []);
};

export default useWindowResize;
