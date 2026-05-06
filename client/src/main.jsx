import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    document.body.innerHTML = '<h1 style="color:red">Error: div with id "root" not found in index.html</h1>';
  } else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error("Render Error:", error);
  document.body.innerHTML = `<div style="padding:20px;color:red"><h1>Rendering Failed</h1><p>${error.message}</p></div>`;
}
