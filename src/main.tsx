import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Canonicalise the host. A trailing dot (trinity.easeai.com.tw.) — which some
// devices keep in the address bar and then propagate to every link you share —
// breaks TLS on strict mobile browsers and makes shared links look dirty. Strip
// it (and any www.) so the URL bar cleans itself and copied links are always clean.
{
  const CANON = 'trinity.easeai.com.tw'
  const h = location.hostname
  const bare = h.replace(/\.+$/, '').replace(/^www\./, '')
  if (h !== CANON && bare === CANON) {
    location.replace(location.protocol + '//' + CANON + location.pathname + location.search + location.hash)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
