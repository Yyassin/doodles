import { useAppStore } from '@/stores/AppStore';
import { useEffect } from 'react';

/**
 * Hook that's subscribed to resize events to
 * update app dimension state for resize handling.
 * @author Yousef Yassin
 */
const useWindowResize = () => {
  const { setAppDimensions } = useAppStore(['setAppDimensions']);
  const handleResize = () => {
    setAppDimensions(window.innerWidth, window.innerHeight);
    console.log(window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
};

export default useWindowResize;
