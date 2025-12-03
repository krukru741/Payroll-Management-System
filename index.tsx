import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[INDEX] Script loaded, looking for root element...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

console.log('[INDEX] Root created, rendering App...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);