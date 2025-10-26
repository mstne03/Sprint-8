/**
 * Calendar and event types for Season Calendar
 */

/**
 * Type of F1 session/event
 */
export type EventType = 'race' | 'qualifying' | 'practice' | 'sprint' | 'shootout';

/**
 * Calendar event resource metadata
 */
export interface EventResource {
  description?: string;
  type?: EventType;
  color?: string;
}

/**
 * Calendar event with F1-specific metadata
 * Used by SeasonCalendar, EventModal, and useSeasonCalendar hook
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: EventResource;
}

/**
 * Calendar view modes
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

/**
 * Modal mode for event operations
 */
export type EventModalMode = 'create' | 'edit' | 'view';
