import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

document.addEventListener('pointermove', (e) => {
  const c = (e.target as HTMLElement).closest?.('.card-glass') as HTMLElement | null
  if (!c) return
  const r = c.getBoundingClientRect()
  c.style.setProperty('--mx', `${e.clientX - r.left}px`)
  c.style.setProperty('--my', `${e.clientY - r.top}px`)
})
