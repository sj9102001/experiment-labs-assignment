import React from 'react';
import { EventItem } from './EventItem'; // Component for rendering individual event items

// Interface defining the structure of an event
interface Event {
    id: string; // Unique identifier for the event
    title: string; // Title of the event
    date: Date; // Date of the event
    color: string; // Color associated with the event
    description?: string; // Optional description of the event
}

interface DayCellProps {
    date: Date; // The specific date this cell represents
    events: Event[]; // Array of all events passed to the calendar
    isCurrentMonth: boolean; // Flag to indicate if the date belongs to the currently displayed month
    onCellClick: (date: Date, events: Event[]) => void; // Handler for when the day cell is clicked
    onEventClick: (event: Event) => void; // Handler for when a specific event is clicked
}

// DayCell component: Represents an individual cell in the calendar grid
export const DayCell: React.FC<DayCellProps> = ({
    date, // The date represented by this cell
    events, // All events passed to the calendar
    isCurrentMonth, // Whether this date is in the current month
    onCellClick, // Handler for cell click
    onEventClick, // Handler for event click
}) => {
    // Filter events to get only those that occur on the current date
    const dayEvents = events.filter((event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );

    return (
        <div
            // Cell container styles, differentiating between current and non-current month days
            className={`border-r border-b p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-50 cursor-pointer transition-colors`}
            onClick={() => onCellClick(date, dayEvents)} // Trigger onCellClick when cell is clicked
        >
            {/* Display the day number */}
            <div className={`text-sm mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {date.getDate()}
            </div>

            {/* Render events for the day, showing up to 3 */}
            <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                    <EventItem
                        key={event.id} // Unique key for each event
                        title={event.title} // Event title
                        color={event.color} // Event color
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent click from bubbling to the cell
                            onEventClick(event); // Trigger onEventClick with the event data
                        }}
                    />
                ))}
                {/* If there are more than 3 events, show a "more" indicator */}
                {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                )}
            </div>
        </div>
    );
};