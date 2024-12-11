"use client"; // Indicates this component is a client-side rendered component
import { useState, useEffect } from "react";
import { Calendar } from "../components/HomePage/Calender"; // Calendar component for displaying events
import AddEventModal from "@/components/modals/AddEventModal"; // Modal for adding new events
import { useAuthState } from "react-firebase-hooks/auth"; // Firebase hook to manage user authentication state
import { auth, db } from "@/lib/firebase/config"; // Firebase authentication and Firestore configuration
import { useRouter } from "next/navigation"; // Next.js hook for programmatic navigation
import { collection, query, getDocs } from "firebase/firestore"; // Firestore functions for querying data

// Interface defining the structure of a calendar event
interface CalendarEvent {
  id: string; // Unique identifier for the event
  title: string; // Title of the event
  date: Date; // Date of the event
  color: string; // Color associated with the event
  description?: string; // Optional description of the event
}

// Main `Home` component
export default function Home() {
  // State to hold the list of events
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // State to manage the visibility of the "Add Event" modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Get the currently authenticated user
  const [user] = useAuthState(auth);

  // Router instance for programmatic navigation
  const router = useRouter();

  // Effect to handle user authentication and fetch events from Firestore
  useEffect(() => {
    // Redirect to login page if the user is not authenticated
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Function to fetch events for the authenticated user from Firestore
    const fetchEvents = async () => {
      try {
        // Reference to the user's events collection in Firestore
        const userEventsRef = collection(db, "users", user.uid, "events");

        // Query the events collection and retrieve the documents
        const eventDocs = await getDocs(query(userEventsRef));

        // Map the fetched documents to the `CalendarEvent` structure
        const fetchedEvents: CalendarEvent[] = eventDocs.docs.map((doc) => {
          const data = doc.data(); // Get document data

          return {
            id: doc.id, // Use document ID as the event ID
            title: data.title || "Untitled Event", // Default title if none is provided
            date: data.date?.toDate() || new Date(), // Convert Firestore timestamp to JavaScript Date
            color: data.color || "bg-blue-500", // Default color if none is provided
            description: data.description || undefined, // Convert null descriptions to undefined
          };
        });

        // Update the events state with the fetched events
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error); // Log errors
      }
    };

    fetchEvents(); // Call the fetch events function
  }, [user, router]); // Dependency array ensures this runs when `user` or `router` changes

  // Return null if user is not authenticated (temporary guard to avoid rendering issues)
  if (!user) {
    return null;
  }

  return (
    <main className="p-4">
      {/* Calendar component to display the events */}
      <Calendar events={events} setEvents={setEvents} onAddEvent={() => setIsAddEventOpen(true)} />

      {/* Add Event Modal component */}
      <AddEventModal
        isAddEventOpen={isAddEventOpen} // Pass modal open state
        setIsAddEventOpen={setIsAddEventOpen} // Function to toggle modal visibility
        setEvents={setEvents} // Function to update the events state
      />
    </main>
  );
}