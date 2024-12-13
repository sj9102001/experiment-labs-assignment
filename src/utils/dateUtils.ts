// Function to get all days in a given month of a specific year
export function getDaysInMonth(year: number, month: number): Date[] {
    // Initialize the date object to the first day of the specified month and year
    const date = new Date(year, month, 1);
    const days: Date[] = [];

    // Loop through the days of the month until the month changes
    while (date.getMonth() === month) {
        // Add a copy of the current date to the array
        days.push(new Date(date));

        // Move to the next day
        date.setDate(date.getDate() + 1);
    }

    // Return the array of all dates in the month
    return days;
}

// Function to get the name of a month given its zero-based index
export function getMonthName(month: number): string {
    // Use a fixed year (e.g., 2000) to create a date and retrieve the month's name
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
}

// Function to check if two Date objects represent the same calendar day
export function isSameDay(date1: Date, date2: Date): boolean {
    // Compare the year, month, and day of both dates
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Function to format a Date object into a readable string
export function formatDate(date: Date): string {
    // Format the date to include the weekday, year, month, and day in English (US locale)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export const formatDateAndTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

