import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './App.css';
import {StartPage} from './StartPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
        <Route exact path='/' component={StartPage}/>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
