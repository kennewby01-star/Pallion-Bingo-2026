import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Critical mounting error:", error);
    rootElement.innerHTML = `
      <div style="color: white; padding: 40px; font-family: sans-serif; text-align: center; background: #020617; height: 100vh;">
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 20px; border-radius: 12px; display: inline-block; max-width: 90%;">
          <h1 style="color: #ef4444; margin-top: 0;">Oops!</h1>
          <p>The Bingo Caller couldn't start properly.</p>
          <pre style="background: #0f172a; padding: 15px; border-radius: 8px; font-size: 12px; text-align: left; overflow: auto; color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);">${error instanceof Error ? error.message : String(error)}</pre>
          <button onclick="location.reload()" style="background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: bold;">Tap to Retry</button>
        </div>
      </div>
    `;
  }
} else {
  console.error("Could not find root element to mount to");
}