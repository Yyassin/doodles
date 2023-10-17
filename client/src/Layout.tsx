import React from 'react';
import { useAppStore } from './stores/AppStore';
import SignUp from './views/SignUpPage';
import SignInPage from './views/SignInPage';
import Dashboard from './views/Dashboard';
import useDrawElements from './hooks/useDrawElements';
import useWindowResize from './hooks/useWindowResize';
import Viewport from './views/Viewport';

/**
 * Layout component that handles routing between pages, and
 * defines the primary structure/layout of the application.
 * @authors Yousef Yassin
 */

const Layout = () => {
  useDrawElements();
  useWindowResize();
  const { mode } = useAppStore(['mode']);

  switch (mode) {
    case 'signup': {
      return <SignUp />;
    }
    case 'signin': {
      return <SignInPage />;
    }
    case 'canvas': {
      return <Viewport />;
    }
    case 'dashboard': {
      return <Dashboard />;
    }
  }
};

export default Layout;
