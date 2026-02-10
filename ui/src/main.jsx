import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CompaniesProvider } from './context/CompaniesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CompaniesProvider>
      <App />
    </CompaniesProvider>
  </React.StrictMode>,
)
