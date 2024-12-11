/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// Props interface defining the structure of props accepted by the EventItem component
interface EventItemProps {
    title: string; // The title of the event
    color: string; // Background color for the event (e.g., class name or color value)
    onClick: (e: any) => void; // Click event handler for the event item
}

// EventItem component: Represents a single event within a calendar day cell
export const EventItem: React.FC<EventItemProps> = ({ title, color, onClick }) => {
    return (
        <div
            // Styling for the event item, including text size, padding, background color, and hover effect
            className={`text-xs p-1 mb-1 rounded truncate ${color} text-white cursor-pointer hover:opacity-80 transition-opacity`}
            title={title} // Tooltip to display the full title on hover
            onClick={onClick} // Attach the click event handler
        >
            {title} {/* Display the event's title */}
        </div>
    );
};
