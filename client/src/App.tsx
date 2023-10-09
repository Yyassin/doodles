import React from 'react';
import SignUp from './views/SignUpPage';
import Dashboard from './views/Dashboard';
import LoginPage from './views/SignInPage';
// import DropDownMenu from './views/DropDownMenu';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  // return <DropDownMenu />; //For some reason menu doesnt show when I use router

  return (
    <>
      <Router>
        <Routes>
          <Route path="/*" Component={SignUp} />
          <Route path="/dashboard" Component={Dashboard} />
          <Route path="/signup" Component={SignUp} />
          <Route path="/signin" Component={LoginPage} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
