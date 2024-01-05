import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/AppStore';
import Layout from './Layout';
import { checkToken, getUserDetails } from './views/SignInPage';
import { ACCESS_TOKEN_TAG, HTTP_STATUS } from './constants';
import { useAuthStore } from './stores/AuthStore';

/**
 * @author Zakariyya Almalki
 * File performs application initialization and authentication checks :)
 */

const Bootstrap = () => {
  const { setMode } = useAppStore(['setMode']);
  const { setUser } = useAuthStore(['setUser']);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_TAG);

    if (token !== null) {
      try {
        const response = await checkToken(token);
        console.log(response.data.authToken.email);
        getUserDetails(response.data.authToken.email, setUser);
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
