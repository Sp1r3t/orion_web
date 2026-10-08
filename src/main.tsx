import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import LoadBoundary from '@/components/ui/LoadBoundary'
import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadBoundary>
      <App />
    </LoadBoundary>
  </StrictMode>,
)
