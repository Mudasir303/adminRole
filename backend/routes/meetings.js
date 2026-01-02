const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

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

module.exports = router;
