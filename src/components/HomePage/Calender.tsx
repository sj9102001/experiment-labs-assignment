/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { MonthView } from './MonthView'; // Component for displaying the calendar's monthly view
import { EventModal } from '../modals/EventModal'; // Modal for viewing or interacting with events
import { getMonthName } from '../../utils/dateUtils'; // Utility function to get the name of a month
import { Button } from '@/components/ui/button'; // UI Button component
import { ChevronLeft, ChevronRight, LogOut, Plus } from 'lucide-react'; // Icons for UI elements
import { signOut } from 'firebase/auth'; // Firebase authentication sign-out function
import { auth } from "@/lib/firebase/config"; // Firebase configuration

// Interface defining the structure of an event
interface Event {
    id: string;
    title: string;
    date: Date;
    color: string;
    description?: string;
}

// Props expected by the Calendar component
interface CalendarProps {
    events: Event[]; // Array of events to display on the calendar
    onAddEvent: () => void; // Function to handle adding a new event
    setEvents: any;
}

// Main Calendar component
export const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, setEvents }) => {
    // State to track the currently displayed month and year
    const [currentDate, setCurrentDate] = useState(new Date());

    // State to manage the visibility of the event modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State to track the date selected in the calendar
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // State to hold events corresponding to the selected date
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

    // State to track a single selected event
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Function to navigate to the previous month
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Function to navigate to the next month
    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Function to handle clicks on a specific calendar cell (day)
    const handleCellClick = (date: Date, events: Event[]) => {
        setSelectedDate(date); // Set the clicked date
        setSelectedEvents(events); // Set the events for the clicked date
        setSelectedEvent(null); // Clear the selected event
        setIsModalOpen(true); // Open the modal
    };

    // Function to handle clicks on a specific event
    const handleEventClick = (event: Event) => {
        setSelectedEvent(event); // Set the selected event
    };

    // Function to handle user logout
    const logoutHandler = () => {
        signOut(auth); // Sign out using Firebase authentication
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header with navigation and controls */}
            <div className="flex flex-wrap justify-between items-center mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-lg shadow-lg">
                {/* Display the current month and year */}
                <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">
                    {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                </h2>
                {/* Navigation and action buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="bg-white text-purple-600 hover:bg-purple-100">
                        <ChevronLeft className="h-4 w-4" /> {/* Left navigation icon */}
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth} className="bg-white text-purple-600 hover:bg-purple-100">
                        <ChevronRight className="h-4 w-4" /> {/* Right navigation icon */}
                    </Button>
                    <Button onClick={onAddEvent} className="bg-white text-purple-600 hover:bg-purple-100">
                        <Plus className="h-4 w-4 mr-2" /> {/* Add event icon */}
                        Add Event
                    </Button>
                    <Button onClick={logoutHandler} className="bg-white text-purple-600 hover:bg-purple-100">
                        <LogOut className="h-4 w-4 mr-2" /> {/* Logout icon */}
                        Logout
                    </Button>
                </div>
            </div>
            {/* Render the MonthView component */}
            <MonthView
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                events={events}
                onCellClick={handleCellClick} // Pass the cell click handler
                onEventClick={handleEventClick} // Pass the event click handler
            />
            {/* Render the EventModal component */}
            <EventModal
                isOpen={isModalOpen}
                setEvents={setEvents} // Pass the setEvents function
                onClose={() => setIsModalOpen(false)} // Close the modal
                events={selectedEvents} // Pass events for the selected date
                selectedEvent={selectedEvent} // Pass the selected event
                onEventClick={handleEventClick} // Pass the event click handler
            />
        </div>
    );
};
