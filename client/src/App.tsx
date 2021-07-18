import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import './App.scss';
// import './Styles/Pnet.scss'
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import RegisterDonePage from './Pages/tempPage/RegisterDonePage';
import HomePage from './Pages/HomePage';
import SubjectSettingPage from './Pages/SubjectSettingPage';
import CalcPage from './Pages/CalcPage';
import PasswordSettingPage from './Pages/PasswordSettingPage';
import NotFound from './Pages/errorPage/NotFound';
import Unauthorized from './Pages/errorPage/Unauthorized';
// import InternalServerError from './Pages/errorPage/InternalServerError';
// import Forbidden from './Pages/errorPage/Forbidden';


const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={LoginPage}/>
        <Route exact path="/registration" component={RegisterPage}/>
        <Route exact path="/registration/done" component={RegisterDonePage} />
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/setting/subject" component={SubjectSettingPage} />
        <Route exact path="/calc" component={CalcPage} />
        <Route exact path="/setting/password" component={PasswordSettingPage} />
        <Route exact path="/error/401" component={Unauthorized} />
        <Route exact path="/error/404" component={NotFound} />
        <Route exact path="" component={NotFound} />
      </Switch>
    </Router>
  )
}

export default Routes;
