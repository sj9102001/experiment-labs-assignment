import React, { useState } from "react";
import { Button } from "../ui/button"; // UI button component
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"; // UI dialog components
import { Input } from "../ui/input"; // UI input component
import { Label } from "../ui/label"; // UI label component
import { collection, addDoc } from "firebase/firestore"; // Firestore functions to interact with the database
import { db } from "@/lib/firebase/config"; // Firestore configuration
import { useAuthState } from "react-firebase-hooks/auth"; // React Firebase hook to manage auth state
import { auth } from "@/lib/firebase/config"; // Firebase authentication configuration

// Interface defining the structure of a calendar event
interface CalendarEvent {
    id: string; // Unique identifier for the event
    title: string; // Event title
    date: Date; // Event date
    color: string; // Background color for the event
    description?: string; // Optional description of the event
}

// Props interface for the AddEventModal component
interface AddEventModalProps {
    isAddEventOpen: boolean; // Determines if the modal is open
    setIsAddEventOpen: (change_to: boolean) => void; // Function to toggle modal visibility
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>; // Function to update the events list
}

// AddEventModal component: Modal for adding a new calendar event
const AddEventModal: React.FC<AddEventModalProps> = ({
    isAddEventOpen, // Modal open state
    setIsAddEventOpen, // Function to set the modal open state
    setEvents, // Function to update the list of events
}) => {
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({}); // State for holding the new event details
    const [user] = useAuthState(auth); // Current authenticated user

    // Function to handle adding a new event
    const handleAddEvent = async () => {
        // Validate required fields and user authentication
        if (!user || !newEvent.title || !newEvent.date) return;

        // Prepare the event object with default values for optional fields
        const event = {
            title: newEvent.title,
            date: new Date(newEvent.date),
            color: newEvent.color || "bg-blue-500", // Default color if none is provided
            description: newEvent.description || undefined, // Use undefined for missing descriptions
        };

        try {
            // Add the event to the Firestore database under the authenticated user's events
            const eventRef = await addDoc(collection(db, "users", user.uid, "events"), event);

            // Update the local state to include the new event
            setEvents((prev) => [...prev, { id: eventRef.id, ...event }]);

            // Close the modal and reset the newEvent state
            setIsAddEventOpen(false);
            setNewEvent({});
        } catch (error) {
            console.error("Error adding event:", error); // Log any errors that occur
        }
    };

    return (
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle> {/* Modal title */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Input for the event title */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={newEvent.title || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    {/* Input for the event date */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={newEvent.date ? newEvent.date.toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, date: new Date(e.target.value) })
                            }
                            className="col-span-3"
                        />
                    </div>
                    {/* Input for the event description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={newEvent.description || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color">
                            Color
                        </Label>
                        <select
                            id="color"
                            value={newEvent.color || 'bg-blue-500'}
                            onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                            className="col-span-3"
                        >
                            <option value="bg-blue-500">Blue</option>
                            <option value="bg-green-500">Green</option>
                            <option value="bg-purple-500">Purple</option>
                            <option value="bg-red-500">Red</option>
                        </select>
                    </div>
                </div>
                {/* Footer with the Add Event button */}
                <DialogFooter>
                    <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEventModal;