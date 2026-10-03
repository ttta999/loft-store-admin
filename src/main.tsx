import React from 'react'
import ReactDOM from 'react-dom/client'
import './lib/theme' // ✅ применяем сохранённую тему ДО первого рендера — без «вспышки»
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)