import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles.css'
import './highlight-themes.css'
import './study.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
