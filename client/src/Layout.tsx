import React from 'react';
import { useAppStore } from './stores/AppStore';
import SignUp from './views/SignUpPage';
import SignInPage from './views/SignInPage';
import Canvas from './views/Canvas';
import Dashboard from './views/Dashboard';

const Layout = () => {
  const { mode } = useAppStore(['mode']);
  switch (mode) {
    case 'signup': {
      return <SignUp />;
    }
    case 'signin': {
      return <SignInPage />;
    }
    case 'canvas': {
      return <Canvas />;
    }
    case 'dashboard': {
      return <Dashboard />;
    }
  }
};

export default Layout;
