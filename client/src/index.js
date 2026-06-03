import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// StrictMode is intentionally disabled — it double-invokes effects in dev
// which disconnects the Socket.io connection before it can receive events.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
