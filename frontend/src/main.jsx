/**
 * This file is the browser entry point: it mounts the root React component.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
