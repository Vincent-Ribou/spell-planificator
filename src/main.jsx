import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StatsProvider } from './context/StatsContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </ThemeProvider>
  </StrictMode>,
)
