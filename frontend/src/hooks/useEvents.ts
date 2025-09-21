import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE

type Event = {
    eventName: string,
    roundNumber: number,
    eventCountry: string,
    eventFormat: string,
    dateStart: Date
}

type Events = Event[]

export default function useEvents() {
    const [events, setEvents] = useState<Events>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [errorEvents, setErrorEvents] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const endpoint = `${API_BASE}/events`;

                const res = await fetch(`${endpoint}`);

                if (!res.ok) throw new Error(`HTTP${res.status}`);

                const data = await res.json();

                setEvents(data)
            } catch (e: any) {
                if (e.name !== "AbortError") setErrorEvents(e.message ?? "Error loading event data")
            } finally {
                setLoadingEvents(false);
            }
        }
        const timeout = setTimeout(() => {
            load()
        }, 200);

        return () => {
            clearTimeout(timeout)
            controller.abort();
        }
    }, [])

    return {
        events,
        setEvents,
        loadingEvents,
        setLoadingEvents,
        errorEvents,
        setErrorEvents,
    }
}