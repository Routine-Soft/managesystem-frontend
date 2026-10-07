import { createContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'theme-preference'
const VALID_THEMES = ['light', 'dark', 'system']

function readStoredTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return VALID_THEMES.includes(stored) ? stored : 'system'
    } catch {
        return 'system'
    }
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readStoredTheme)

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        try {
            localStorage.setItem(STORAGE_KEY, theme)
        } catch {
            // storage indisponível (modo privado): o tema vale só para esta sessão
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext
