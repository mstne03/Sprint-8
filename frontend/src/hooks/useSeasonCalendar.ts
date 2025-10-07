import type { CalendarEvent } from "@/components/calendar/SeasonCalendar";
import { useState } from "react";
import type { View } from "react-big-calendar";

const useSeasonCalendar = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [currentView, setCurrentView] = useState<View>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedEvent(null);
        setModalMode('create');
        setIsModalOpen(true);
        
        setSelectedEvent({
            id: '',
            title: '',
            start,
            end,
            resource: {}
        });
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEventDrop = (args: any) => {
        const { event, start, end } = args;
        setEvents(prevEvents =>
            prevEvents.map(evt =>
            evt.id === event.id ? { ...evt, start: new Date(start), end: new Date(end) } : evt
            )
        );
    };

    const handleEventResize = (args: any) => {
        const { event, start, end } = args;
        setEvents(prevEvents =>
            prevEvents.map(evt =>
            evt.id === event.id ? { ...evt, start: new Date(start), end: new Date(end) } : evt
            )
        );
    };

    const createEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = {
            id: crypto.randomUUID(),
            ...eventData,
        };
        setEvents(prev => [...prev, newEvent]);
        setIsModalOpen(false);
    };

    const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
        setEvents(prev =>
            prev.map(event =>
            event.id === id ? { ...event, ...eventData } : event
            )
        );
        setIsModalOpen(false);
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(event => event.id !== id));
        setIsModalOpen(false);
    };

    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    const handleViewChange = (view: View) => {
        setCurrentView(view);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const backgroundColor = event.resource?.color || '#3174ad';
        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return {
        setSelectedEvent, setModalMode,
        setIsModalOpen, events, currentView,
        currentDate, handleViewChange,
        handleNavigate, handleSelectSlot,
        handleSelectEvent, handleEventDrop,
        handleEventResize, eventStyleGetter,
        isModalOpen, modalMode, selectedEvent,
        createEvent, updateEvent, deleteEvent,
    }
}

export default useSeasonCalendar