import React from 'react';
import logo from './logo.svg';
import './App.css';
import Speech from "./Speech"
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Speech/>
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        <script src="https://unpkg.com/ml5@0.__.3/dist/ml5.min.js"></script>
      </header>
    </div>
  );
}

export default App;
