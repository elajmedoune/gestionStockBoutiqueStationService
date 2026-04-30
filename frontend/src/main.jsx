import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
<<<<<<< HEAD
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
=======
import 'daisyui/daisyui.css'
>>>>>>> origin/feature/badiene-front

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)