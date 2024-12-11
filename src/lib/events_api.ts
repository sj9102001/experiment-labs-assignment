import { Event } from '@prisma/client'

export async function fetchEvents(): Promise<Event[]> {
    const response = await fetch('/api/events')
    if (!response.ok) {
        throw new Error('Failed to fetch events')
    }
    return response.json()
}

export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    })
    if (!response.ok) {
        throw new Error('Failed to create event')
    }
    return response.json()
}

export async function updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    })
    if (!response.ok) {
        throw new Error('Failed to update event')
    }
    return response.json()
}

export async function deleteEvent(id: string): Promise<void> {
    const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        throw new Error('Failed to delete event')
    }
}
