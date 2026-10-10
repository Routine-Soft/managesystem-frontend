import './styles/theme.css'
import './styles/ui.css'
import './styles/app.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@/context/ThemeContext'
import IdiomaProvider from '@/i18n/IdiomaProvider'
import { registrarApp } from '@/utils/instalarApp'

registrarApp()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <IdiomaProvider>
                <App />
            </IdiomaProvider>
        </ThemeProvider>
    </StrictMode>,
)
