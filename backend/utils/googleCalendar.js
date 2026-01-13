const { google } = require('googleapis');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Path to your service account key file
// Make sure to place 'service-account.json' in the backend root directory
const KEYFILEPATH = path.join(__dirname, '..', 'service-account.json');

// Scopes required for the API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Your Admin Calendar ID (usually your email address)
// You should add GOOGLE_CALENDAR_ID=your_email@gmail.com to your .env file
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Create a GoogleAuth client with Domain-Wide Delegation (Subject Impersonation)
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
    clientOptions: {
        subject: CALENDAR_ID // The user to impersonate (your paid email)
    }
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Creates a Google Calendar event with a Meet link.
 * 
 * @param {Object} eventDetails - The details of the meeting.
 * @param {string} eventDetails.summary - Event title.
 * @param {string} eventDetails.description - Event description.
 * @param {string} eventDetails.startTime - ISO string of start time.
 * @param {string} eventDetails.endTime - ISO string of end time.
 * @param {Array<string>} eventDetails.attendees - List of email strings to invite.
 */
const createCalendarEvent = async ({ summary, description, startTime, endTime, attendees }) => {
    try {
        // Convert array of emails to format required by API: [{email: 'a@b.com'}, ...]
        const attendeeObjects = attendees.map(email => ({ email }));

        const event = {
            summary: summary,
            description: description,
            start: {
                dateTime: startTime,
                timeZone: 'Asia/Kolkata', // Default or dynamic if needed
            },
            end: {
                dateTime: endTime,
                timeZone: 'Asia/Kolkata',
            },
            attendees: [],
            conferenceData: {
                createRequest: {
                    requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2)}`, // Unique ID for every request
                    conferenceSolutionKey: {
                        type: "hangoutsMeet"
                    }
                }
            },
        };

        // We must insert the event. 
        // IMPORTANT: 'conferenceDataVersion: 1' is required to actually generate the Meet link.
        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all', // Sends email notifications to attendees (Admin + User)
        });

        console.log('Event created successfully: %s', response.data.htmlLink);
        return {
            eventId: response.data.id,
            meetLink: response.data.hangoutLink, // This is the Google Meet URL
            htmlLink: response.data.htmlLink
        };

    } catch (error) {
        console.warn("Google Calendar API Error:", error.message);
        console.warn("Ensure 'service-account.json' exists in backend/ and GOOGLE_CALENDAR_ID is set in .env");
        // We return null so the app doesn't crash; the meeting will still be saved to DB locally.
        return null;
    }
};

module.exports = { createCalendarEvent };
