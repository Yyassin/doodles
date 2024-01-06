import React from 'react';
import './App.css';
import Bootstrap from './Bootstrap';
import Titlebar from './components/lib/Titlebar/Titlebar';
import { ipcAPI } from './data/ipc/ipcMessages';

function App() {
  return (
    <div>
      {ipcAPI && <Titlebar fg={'#000'} title={'Doodles'} />}
      <Bootstrap />
    </div>
  );
}

export default App;
