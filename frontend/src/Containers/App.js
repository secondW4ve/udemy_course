import React from 'react';
import { Route, Switch } from "react-router-dom";

import LoginPage from '../Pages/LoginPage';
import UserSignupPage from '../Pages/UserSignupPage';
import HomePage from "../Pages/HomePage";
import UserPage from '../Pages/UserPage';
import TopBar from '../Components/TopBar';
// Через actions передаються функції в компоненти які до їх ніякого відношення не мають

function App() {
  return (
      <div>
		<TopBar/>
		<div className = "container">
			<Switch>
				<Route exact path = "/" component = {HomePage}></Route>
				<Route 
					path = "/login" 
					component = {LoginPage}
				></Route>
				<Route 
					path = "/signup" 
					component = {UserSignupPage}
				></Route>
				<Route path = "/:username" component = {UserPage}></Route>
			</Switch>
		</div>
      </div>
  );
}

export default App;
