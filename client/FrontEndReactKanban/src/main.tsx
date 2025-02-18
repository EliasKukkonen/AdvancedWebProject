import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
// i18n configuration to ensure translations are set up
import './i18n'; 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
