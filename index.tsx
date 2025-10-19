import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Construct an absolute URL to the service worker to avoid cross-origin errors.
    const swUrl = new URL('sw.js', window.location.href).href;
    navigator.serviceWorker.register(swUrl)
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);