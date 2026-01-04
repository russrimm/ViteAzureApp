// This is the entry point of the React application
// It's the first JavaScript file that runs when the app starts

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Find the HTML element with id="root" in index.html and mount our React app there
// The ! tells TypeScript we're sure this element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode helps catch potential problems during development
  // It runs extra checks and warnings (only in development, not production)
  <React.StrictMode>
    {/* This renders the main App component, which contains all our pages and routes */}
    <App />
  </React.StrictMode>
);
