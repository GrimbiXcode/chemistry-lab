import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { I18nGate } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <I18nGate>
        <App />
      </I18nGate>
    </HashRouter>
  </StrictMode>,
)
