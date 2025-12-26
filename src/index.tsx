import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './shared/responsive.css';
import App from './App';
import '@fontsource/poppins';
import 'bootstrap/dist/css/bootstrap.min.css';



const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found. Make sure 'index.html' has a <div id='root'> element.");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

