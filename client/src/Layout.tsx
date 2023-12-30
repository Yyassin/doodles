import React from 'react';
import { useAppStore } from './stores/AppStore';
import SignUp from './views/SignUpPage';
import SignInPage from './views/SignInPage';
import Dashboard from './views/Dashboard';
import useDrawElements from './hooks/useDrawElements';
import useMultiSelection from './hooks/useMultiSelection';
import useWindowResize from './hooks/useWindowResize';
import { useSocket } from './hooks/useSocket';
import { useShortcuts } from './hooks/useShortcut';
import Viewport from './views/Viewport';

/**
 * Layout component that handles routing between pages, and
 * defines the primary structure/layout of the application.
 * @authors Yousef Yassin
 */

const Layout = () => {
  useDrawElements();
  useMultiSelection();
  useWindowResize();
  useShortcuts();
  useSocket();
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
