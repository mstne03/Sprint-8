import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE;

export default function useChart() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [eventName, setEventName] = useState<string | undefined>(undefined)
    const [sessionType, setSessionType] = useState<string | undefined>(undefined)
    const [driver, setDriver] = useState<string | undefined>(undefined)

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true); setError(null);

                const query = `${eventName === undefined ? "Select GP" : eventName}/${sessionType === undefined ? "Select session" : sessionType}/${driver === undefined ? "" : driver}`

                const endpoint = `${API_BASE}/${query}`

                const res = await fetch(`${endpoint}/chart_data/`, { signal: controller.signal});

                if (!res.ok) throw new Error(`HTTP${res.status}`);

                const data = await res.json();

            } catch (e: any) {
                if (e.name !== "AbortError") setError(e.message ?? "Error loading chart data");
            } finally {
                setLoading(false);
            }
        }
        const timeout = setTimeout(() => {
            load()
        }, 400)
        return () => {
            clearTimeout(timeout);
            controller.abort();
        }
    }, [eventName, sessionType, driver])

    return {
        loading,
        setLoading,
        error,
        setError,
        eventName,
        setEventName,
        sessionType,
        setSessionType,
        driver,
        setDriver,
    }
}