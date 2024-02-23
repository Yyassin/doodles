import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/AppStore';
import Layout from './Layout';
import { checkToken, getUserDetails } from './views/SignInPage';
import { ACCESS_TOKEN_TAG, HTTP_STATUS } from './constants';
import { useAuthStore } from './stores/AuthStore';
import { useCanvasBoardStore } from './stores/CanavasBoardStore';
import { useCanvasElementStore } from './stores/CanvasElementsStore';
import { useCommentsStore } from './stores/CommentsStore';

/**
 * @author Zakariyya Almalki
 * File performs application initialization and authentication checks :)
 */

const Bootstrap = () => {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const { setCanvases, setBoardMeta } = useCanvasBoardStore([
    'setCanvases',
    'setBoardMeta',
  ]);
  const { setCanvasElementState } = useCanvasElementStore([
    'setCanvasElementState',
  ]);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_TAG);

    if (token !== null) {
      try {
        const response = await checkToken(token);
        const isSharedCanvas = (
          await getUserDetails(
            response.data.authToken.email,
            setUser,
            setCanvases,
            setBoardMeta,
            setCanvasElementState,
          )
        )?.valueOf();
        if (response.status === HTTP_STATUS.SUCCESS) {
          setMode(isSharedCanvas ? 'canvas' : 'dashboard');
          return;
        }
      } catch (error) {}
    }
    setMode('signin');
  };
  useEffect(() => {
    auth().then(() => setIsLoaded(true));
  }, []);
  return isLoaded ? <Layout /> : null;
};

export default Bootstrap;
