import React from 'react';
import { DayCell } from './DayCell'; // Component to render individual day cells
import { getDaysInMonth } from '../../utils/dateUtils'; // Utility function to retrieve all days in a month

// Interface defining the structure of an event
interface Event {
    id: string; // Unique identifier for the event
    title: string; // Title of the event
    date: Date; // Date of the event
    color: string; // Color associated with the event
    description?: string; // Optional description of the event
    calendarId: string;
}

// Props expected by the MonthView component
interface MonthViewProps {
    year: number; // The year to display
    month: number; // The zero-based index of the month to display
    events: Event[]; // Array of events to display on the calendar
    onCellClick: (date: Date, events: Event[]) => void; // Handler for when a day cell is clicked
    onEventClick: (event: Event) => void; // Handler for when a specific event is clicked
}

// MonthView component: Displays the calendar for a specific month
export const MonthView: React.FC<MonthViewProps> = ({
    year, // Year of the month to display
    month, // Month to display (zero-based index)
    events, // Array of events to display in the calendar
    onCellClick, // Handler for day cell click
    onEventClick, // Handler for event click
}) => {
    // Get all days in the specified month
    const days = getDaysInMonth(year, month);

    // Determine the weekday (0-6) of the first day of the month
    const firstDayOfWeek = days[0].getDay();

    // Create placeholders for days from the previous month to align the calendar grid
    const daysFromPreviousMonth = Array(firstDayOfWeek).fill(null);

    return (
        <div className="grid grid-cols-7 border-l border-t">
            {/* Render the weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-sm font-semibold p-2 border-r border-b bg-gray-100">
                    {day} {/* Display the name of the day */}
                </div>
            ))}
            {/* Render placeholders for the previous month's trailing days */}
            {daysFromPreviousMonth.map((_, index) => (
                <div key={`prev-${index}`} className="border-r border-b bg-gray-100" />
            ))}
            {/* Render the actual days of the month */}
            {days.map((date) => (
                <DayCell
                    key={date.toISOString()} // Use ISO string of the date as a unique key
                    date={date} // Pass the date for this cell
                    events={events} // Pass all events
                    isCurrentMonth={true} // Flag to indicate that the date is in the current month
                    onCellClick={onCellClick} // Pass the handler for cell clicks
                    onEventClick={onEventClick} // Pass the handler for event clicks
                />
            ))}
        </div>
    );
};
