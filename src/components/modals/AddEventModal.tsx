/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { google } from "googleapis"
interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    color: string;
    description?: string;
    calendarId: string
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

    const addToGoogleCalender = async (accessToken: string, event: Partial<CalendarEvent>) => {
        try {
            const response = await fetch("/api/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, event }),
            });

            if (!response.ok) {
                throw new Error("Failed to add event to Google Calendar");
            }

            const data = await response.json();
            console.log("Google Calendar Event Created:", data);
            return data;
        } catch (error) {
            console.error(error);
        }
    };
    const handleAddEvent = async () => {
        if (!user || !newEvent.title || !newEvent.date) return;


        try {
            setLoading(true);
            const token = localStorage.getItem("googleAccessToken")!;

            const event = {
                title: newEvent.title,
                date: new Date(newEvent.date),
                color: newEvent.color || "bg-blue-500",
                description: newEvent.description || undefined,
                isReminderSent: false,
            };
            const data = await addToGoogleCalender(token, event);
            if (!data) {
                throw new Error("Failed to retrieve event ID from Google Calendar");
            }
            const eventWithCalendarId = {
                ...event,
                calendarId: data.data.id, // Include the Google Calendar event ID
            };
            const eventRef = await addDoc(collection(db, "users", user.uid, "events"), eventWithCalendarId);

            setEvents((prev) => [...prev, { id: eventRef.id, ...eventWithCalendarId }]);

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