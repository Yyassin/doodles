import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/AppStore';
import Layout from './Layout';
import { checkToken, getUserDetails } from './views/SignInPage';
import { ACCESS_TOKEN_TAG, HTTP_STATUS } from './constants';
import { useAuthStore } from './stores/AuthStore';
import { useCanvasBoardStore } from './stores/CanavasBoardStore';

/**
 * @author Zakariyya Almalki
 * File performs application initialization and authentication checks :)
 */

const Bootstrap = () => {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const { setCanvases } = useCanvasBoardStore(['setCanvases']);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_TAG);

    if (token !== null) {
      try {
        const response = await checkToken(token);
        getUserDetails(response.data.authToken.email, setUser, setCanvases);
        if (response.status === HTTP_STATUS.SUCCESS) {
          setMode('dashboard');
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
