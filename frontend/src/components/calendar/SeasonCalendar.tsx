import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { EventModal } from '@/components/ui';
import './calendar-theme.css';
import { useSeasonCalendar } from '@/hooks/calendar';
import type { CalendarEvent } from '@/types/calendarTypes';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(Calendar);

export const SeasonCalendar = () => {
  const {
    setSelectedEvent, setModalMode,
    setIsModalOpen, events, currentView,
    currentDate, handleViewChange,
    handleNavigate, handleSelectSlot,
    handleSelectEvent, handleEventDrop,
    handleEventResize, eventStyleGetter,
    isModalOpen, modalMode, selectedEvent,
    createEvent, updateEvent, deleteEvent,
  } = useSeasonCalendar()

  return (
    <div className="min-h-screen rounded-2xl bg-gradient-to-br bg-gray-900 border p-4 border-blue-900">
      <div className="mb-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-white">Calendario F1 2025</h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600/80 backdrop-blur-sm text-white rounded-xl hover:bg-blue-700/80 transition-all duration-300 border border-blue-500/30 shadow-lg"
        >
          + New Event
        </button>
      </div>

      <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)' }}
          
          view={currentView}
          date={currentDate}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          
          selectable={true}
          resizable={true}
          popup={true}
          toolbar={true}
          
          views={['month', 'week', 'day', 'agenda']}
          
          eventPropGetter={eventStyleGetter}
          step={30}
          timeslots={2}
          showMultiDayTimes={true}
          
          messages={{
            allDay: 'All day',
            previous: 'Previous',
            next: 'Next',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Hour',
            event: 'Event',
            noEventsInRange: 'No events for this range',
            showMore: (total: number) => `+ See more (${total})`
          }}
        />
      </div>
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          mode={modalMode}
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onCreate={createEvent}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
          onEdit={() => setModalMode('edit')}
        />
      )}
    </div>
  );
};