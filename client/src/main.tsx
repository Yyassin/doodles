import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Theme>
      <App />
    </Theme>
  </React.StrictMode>,
);

postMessage({ payload: 'removeLoading' }, '*');
