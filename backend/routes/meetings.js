const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

// @route   POST api/meetings
// @desc    Schedule a new meeting
// @access  Public
const sendEmail = require('../utils/sendEmail');

// @route   POST api/meetings
// @desc    Schedule a new meeting
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, phone, website, date, time, isoDate, duration, timeZone } = req.body;

    try {
        const newMeeting = new Meeting({
            name,
            email,
            subject,
            phone,
            website,
            date,
            time,
            isoDate,
            duration,
            timeZone
        });

        const meeting = await newMeeting.save();

        // Construct Email Message
        const message = `
            <h3>New Meeting Scheduled</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Date & Time:</strong> ${date} at ${time} (${timeZone})</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p><strong>Website:</strong> ${website}</p>
        `;

        try {
            await sendEmail({
                to: process.env.EMAIL_USER, // Send validation to admin
                subject: `New Meeting Request from ${name}`,
                html: message
            });

            // Construct User Confirmation Email
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
                    <li><strong>Phone Provided:</strong> ${phone}</li>
                </ul>
                <p>We look forward to speaking with you.</p>
                <p>Best regards,<br>Shield Support Team</p>
            `;

            await sendEmail({
                to: email, // Send confirmation to user
                subject: `Meeting Confirmation: ${subject}`,
                html: userMessage
            });

        } catch (emailError) {
            console.error("Email send failed:", emailError);
            // We do NOT want to fail the request if email fails, just log it.
        }

        res.json(meeting);
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
        const meetings = await Meeting.find().sort({ isoDate: 1 }); // Sort by meeting date ascending
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
