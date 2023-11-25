import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/AppStore';
import Layout from './Layout';
import { checkToken } from './views/SignInPage';
import { HTTP_STATUS } from './constants';

/**
 * @author Zakariyya Almalki
 * File performs application initialization and authentication checks :)
 */

const Bootstrap = () => {
  const { setMode } = useAppStore(['setMode']);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token !== null) {
      try {
        const response = await checkToken(token);
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
