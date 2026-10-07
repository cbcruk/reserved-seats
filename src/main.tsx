import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/app/app'
import { SeatingProvider } from './seating/seating-store'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <SeatingProvider>
      <App />
    </SeatingProvider>
  </StrictMode>,
)
