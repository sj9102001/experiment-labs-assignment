import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"; // UI dialog components
import { formatDate } from "../../utils/dateUtils"; // Utility function to format dates
import { doc, deleteDoc } from "firebase/firestore"; // Firestore functions for deleting a document
import { auth, db } from "@/lib/firebase/config"; // Firestore configuration
import { Button } from "@/components/ui/button"; // UI button component
import { useAuthState } from "react-firebase-hooks/auth";

// Interface defining the structure of an event
interface Event {
    id: string; // Unique identifier for the event
    title: string; // Title of the event
    date: Date; // Date of the event
    color: string; // Color associated with the event
    description?: string; // Optional description of the event
}

// Props interface for the EventModal component
interface EventModalProps {
    isOpen: boolean; // Determines if the modal is open
    onClose: () => void; // Function to handle closing the modal
    events: Event[]; // List of events to display in the modal
    selectedEvent: Event | null; // The currently selected event, if any
    onEventClick: (event: Event) => void; // Function to handle clicking on an event
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>; // Function to update the events list
}

// EventModal component: Displays event details or a list of events
export const EventModal: React.FC<EventModalProps> = ({
    isOpen, // Modal open state
    onClose, // Function to close the modal
    events, // Array of events to display
    selectedEvent, // Currently selected event (if any)
    onEventClick, // Function to handle event clicks
    setEvents, // Function to update the events state
}) => {
    // Function to handle deleting an event
    const [user] = useAuthState(auth);
    const handleDeleteEvent = async () => {
        if (!selectedEvent) return; // Ensure an event is selected

        try {
            // Reference the Firestore document for the event
            const eventDocRef = doc(db, "users", user!.uid, "events", selectedEvent.id);

            // Delete the document from Firestore
            await deleteDoc(eventDocRef);

            // Remove the event from the local state
            setEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== selectedEvent.id)
            );

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    {/* Title changes depending on whether an event is selected */}
                    <DialogTitle>
                        {selectedEvent ? "Event Details" : "Events"}
                    </DialogTitle>
                </DialogHeader>
                {/* Render details of the selected event, if any */}
                {selectedEvent ? (
                    <div>
                        <h3 className="text-lg font-semibold">
                            {selectedEvent.title}
                        </h3>{" "}
                        {/* Event title */}
                        <p className="text-sm text-gray-500">
                            {formatDate(selectedEvent.date)}
                        </p>{" "}
                        {/* Formatted event date */}
                        <p className="mt-2">
                            {selectedEvent.description ||
                                "No description provided."}
                        </p>{" "}
                        {/* Event description or placeholder */}
                        <DialogFooter>
                            {/* Delete Event Button */}
                            <Button
                                variant="destructive"
                                onClick={handleDeleteEvent}
                            >
                                Delete Event
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // Render a list of events if no specific event is selected
                    <ul className="space-y-2">
                        {events.map((event) => (
                            <li
                                key={event.id} // Unique key for each event
                                className="cursor-pointer p-2 rounded hover:bg-gray-100" // Styling and hover effect
                                onClick={() => onEventClick(event)} // Handle event click
                            >
                                <div className="flex items-center">
                                    {/* Circle indicator with event color */}
                                    <div
                                        className={`w-3 h-3 rounded-full mr-2 ${event.color}`}
                                    ></div>
                                    <span>{event.title}</span>{" "}
                                    {/* Event title */}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
};