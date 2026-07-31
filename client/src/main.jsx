import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initGlobalLogger } from './utils/logger.js'
import './index.css'
import App from './App.jsx'

// Initialize the global error logger before React mounts
initGlobalLogger()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
