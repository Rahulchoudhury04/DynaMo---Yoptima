import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'

// Global error handler — prevents blank screen on uncaught errors
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#94A3B8;font-family:system-ui,sans-serif;text-align:center;padding:2rem;">
        <h2 style="color:#F1F5F9;margin-bottom:0.5rem;">Something went wrong</h2>
        <p style="margin-bottom:1rem;max-width:400px;">${event.message || 'An unexpected error occurred.'}</p>
        <button onclick="location.reload()" style="padding:8px 24px;border-radius:8px;border:none;background:#2563EB;color:#fff;font-weight:600;cursor:pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
