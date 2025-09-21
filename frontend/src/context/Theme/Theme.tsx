import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export const ThemeContext = createContext<{theme: string, toggleTheme: () => void}>({theme: 'dark', toggleTheme: () => {}});

const ThemeProvider = ({ children }: {children:ReactNode}) => {
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <ThemeContext value={{theme, toggleTheme}}>
            {children}
        </ThemeContext>
    )
}

export default ThemeProvider;
