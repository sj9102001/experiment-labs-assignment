import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accessToken, event } = body;
        console.log(accessToken, event);

        if (!accessToken || !event) {
            return NextResponse.json(
                { message: "Missing required parameters: accessToken or event" },
                { status: 400 }
            );
        }

        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000" // Replace with your redirect URI
        );
        oAuth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

        const gEvent = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: event.date,
                timeZone: "UTC",
            },
            end: {
                dateTime: new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString(), // 1-hour duration
                timeZone: "UTC",
            },
        };
        const response = await calendar.events.insert({
            auth: oAuth2Client,
            calendarId: "primary",
            requestBody: gEvent,
        });
        console.log(response.data);
        return NextResponse.json({ data: response.data });
    } catch (error) {
        console.error("Error adding event to Google Calendar:", error);

        return NextResponse.json(
            { message: "Internal Server Error", error: "NOT WORKING" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { accessToken, eventId } = body;

        if (!accessToken || !eventId) {
            return NextResponse.json(
                { message: "Missing required parameters: accessToken or eventId" },
                { status: 400 }
            );
        }

        console.log(process.env.GOOGLE_CLIENT_ID);
        console.log(process.env.GOOGLE_CLIENT_SECRET);

        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000" // Replace with your redirect URI
        );
        oAuth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

        // Delete the event from Google Calendar
        await calendar.events.delete({
            auth: oAuth2Client,
            calendarId: "primary",
            eventId: eventId,
        });

        return NextResponse.json({ message: "Event successfully deleted" });
    } catch (error) {
        console.error("Error deleting event from Google Calendar:", error);

        return NextResponse.json(
            { message: "Internal Server Error", error: "NOT WORKING" },
            { status: 500 }
        );
    }
}