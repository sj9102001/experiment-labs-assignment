import React, { useState } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    color: string;
    description?: string;
}

interface AddEventModalProps {
    isAddEventOpen: boolean;
    setIsAddEventOpen: (change_to: boolean) => void;
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
    isAddEventOpen,
    setIsAddEventOpen,
    setEvents,
}) => {
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);

    const handleAddEvent = async () => {
        if (!user || !newEvent.title || !newEvent.date) return;

        const event = {
            title: newEvent.title,
            date: new Date(newEvent.date),
            color: newEvent.color || "bg-blue-500",
            description: newEvent.description || undefined,
            isReminderSent: false
        };

        try {
            setLoading(true);
            const eventRef = await addDoc(collection(db, "users", user.uid, "events"), event);

            setEvents((prev) => [...prev, { id: eventRef.id, ...event }]);

            setIsAddEventOpen(false);
            setNewEvent({});
        } catch (error) {
            console.error("Error adding event:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={newEvent.title || ""}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, title: e.target.value })
                            }
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="datetime">Date & Time</Label>
                        <Input
                            id="datetime"
                            type="datetime-local"
                            value={
                                newEvent.date
                                    ? new Date(newEvent.date.getTime() - newEvent.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                    : ""
                            }
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    date: new Date(e.target.value),
                                })
                            }
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={newEvent.description || ""}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    description: e.target.value,
                                })
                            }
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color">Color</Label>
                        <select
                            id="color"
                            value={newEvent.color || "bg-blue-500"}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, color: e.target.value })
                            }
                            className="col-span-3"
                        >
                            <option value="bg-blue-500">Blue</option>
                            <option value="bg-green-500">Green</option>
                            <option value="bg-purple-500">Purple</option>
                            <option value="bg-red-500">Red</option>
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddEvent} disabled={loading}>
                        {loading ? "Adding..." : "Add Event"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEventModal;