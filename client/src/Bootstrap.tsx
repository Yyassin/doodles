import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores/AppStore';
import Layout from './Layout';
import { checkToken } from './views/SignInPage';

/**
 * @author Zakariyya Almalki
 */

const Bootstrap = () => {
  const { setMode } = useAppStore(['setMode']);
  const [loaded, setLoaded] = useState(false);
  const auth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token !== null) {
      try {
        const response = await checkToken(token);
        if (response.status === 200) {
          setMode('dashboard');
          setLoaded(true);
          return;
        }
      } catch (error) {}
    }
    setMode('signin');
    setLoaded(true);
  };
  useEffect(() => {
    auth();
  }, []);
  return !loaded ? null : <Layout />;
};

export default Bootstrap;
