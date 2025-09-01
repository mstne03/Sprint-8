import Header from '../../components/Header/Header'
import Table from '../../components/Table/Table'
import { ThemeContext } from '../../context/Theme/Theme'
import { useContext, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:800/api";

export default function Home () {
    const { theme, toggleTheme } = useContext(ThemeContext)

    useEffect(() => {
        const controller = new AbortController();

        const load = async () =>  {
            try {
                const res = await fetch(`${API_BASE}/drivers/import?years=2023,2024,2025`);

                if (!res.ok) throw new Error(`HTTP${res.status}`);

            } catch (e: any) {
                console.error("Error:",e);
            }
        }
        load()
        return () => controller.abort();
    })

    return (
        <div>
           <Header />
           <Table/>
           <h4>Panel {theme}</h4>
           <button onClick={toggleTheme}>Toggle</button>
        </div>
    )
}
