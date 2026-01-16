const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// @route   POST api/meetings
// @desc    Schedule a new meeting
// @access  Public
const sendEmail = require('../utils/sendEmail');
const { createCalendarEvent } = require('../utils/googleCalendar');

// @route   POST api/meetings
// @desc    Schedule a new meeting
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, phone, website, date, time, isoDate, duration, timeZone } = req.body;

    try {
        // 1. Save Meeting Immediately (Fast Response)
        const newMeeting = new Meeting({
            name, email, subject, phone, website, date, time, isoDate, duration, timeZone
        });
        const savedMeeting = await newMeeting.save();
        res.json(savedMeeting); // Respond to client immediately

        // 2. Background Process (Fire-and-Forget)
        (async () => {
            try {
                // --- Google Calendar Integration ---
                const startDateTime = new Date(isoDate);
                const durationMinutes = parseInt(duration) || 30;
                const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

                const calendarResult = await createCalendarEvent({
                    summary: `Meeting: ${subject} with ${name}`,
                    description: `Scheduled via Shield Support.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website}\n\nSubject: ${subject}`,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    attendees: []
                });

                let finalMeetLink = '';
                if (calendarResult && calendarResult.meetLink) {
                    finalMeetLink = calendarResult.meetLink;
                    // Update the existing meeting record asynchronously
                    await Meeting.findByIdAndUpdate(savedMeeting._id, {
                        meetLink: finalMeetLink,
                        googleEventId: calendarResult.eventId
                    });
                } else {
                    finalMeetLink = "Check Google Calendar";
                }

                // --- Emails ---
                const message = `
                    <h3>New Meeting Scheduled</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Date & Time:</strong> ${date} at ${time} (${timeZone})</p>
                    <p><strong>Duration:</strong> ${duration}</p>
                    <p><strong>Website:</strong> ${website}</p>
                    <p><strong>Meeting Link:</strong> <a href="${finalMeetLink}" target="_blank">${finalMeetLink}</a></p>
                    ${!calendarResult ? '<p><small>(Note: Using Jitsi Meet because Google Calendar integration is not fully configured)</small></p>' : ''}
                `;

                sendEmail({
                    to: process.env.EMAIL_USER,
                    subject: `New Meeting Request from ${name}`,
                    html: message
                }).catch(err => console.error("Admin Email Failed:", err));

                const userMessage = `
                    <h3>Meeting Confirmation</h3>
                    <p>Dear ${name},</p>
                    <p>Thank you for scheduling a meeting with Shield Support.</p>
                    <p><strong>Your Meeting Details:</strong></p>
                    <ul>
                        <li><strong>Subject:</strong> ${subject}</li>
                        <li><strong>Date:</strong> ${date}</li>
                        <li><strong>Time:</strong> ${time} (${timeZone})</li>
                        <li><strong>Duration:</strong> ${duration}</li>
                        <li><strong>Meeting Link:</strong> <a href="${finalMeetLink}" target="_blank">${finalMeetLink}</a></li>
                    </ul>
                    <p>Please click the link above at the scheduled time to join the meeting.</p>
                    <p>Best regards,<br>Shield Support Team</p>
                `;

                sendEmail({
                    to: email,
                    subject: `Meeting Confirmation: ${subject}`,
                    html: userMessage
                }).catch(err => console.error("User Email Failed:", err));

            } catch (bgError) {
                console.error("Background Processing Error:", bgError);
            }
        })();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/meetings
// @desc    Get all meetings
// @access  Public (Should be protected in real app)
router.get('/', async (req, res) => {
    try {
        const meetings = await Meeting.find().sort({ createdAt: -1 }); // Sort by creation date descending
        res.json(meetings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/meetings/:id
// @desc    Delete a meeting
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        await meeting.deleteOne();
        res.json({ msg: 'Meeting removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Meeting not found' });
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/meetings/:id
// @desc    Update a meeting (e.g. admin notes)
// @access  Public (Should be protected)
router.put('/:id', async (req, res) => {
    const { adminUpdate } = req.body;

    try {
        let meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ msg: 'Meeting not found' });

        // Update fields
        if (adminUpdate !== undefined) meeting.adminUpdate = adminUpdate;

        await meeting.save();
        res.json(meeting);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Meeting not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
