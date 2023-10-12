import React from 'react';
import SignUp from './views/SignUpPage';
import Dashboard from './views/Dashboard';
import LoginPage from './views/SignInPage';
import Toolbar from './views/ToolBar';
import DropDownMenu from './views/DropDownMenu';
import Canvas from './views/Canvas';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/*" Component={SignUp} />
          <Route path="/dashboard" Component={Dashboard} />
          <Route path="/toolbar" Component={Toolbar} />
          <Route path="/canvas" Component={Canvas} />
          <Route path="/signup" Component={SignUp} />
          <Route path="/dropdownmenu" Component={DropDownMenu} />
          <Route path="/signin" Component={LoginPage} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
