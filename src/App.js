import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './App.css';
import {StartPage} from './StartPage';
import {SignIn} from './SignIn';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
        <Route exact path='/' component={StartPage}/>
        <Route path='/signin' component={SignIn}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
