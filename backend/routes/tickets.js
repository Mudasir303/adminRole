const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/admin");

// @route   POST /api/tickets
// @desc    Create a ticket
// @access  Private
router.post("/", auth, async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const ticket = new Ticket({
            user: req.user.id,
            subject,
            message,
            priority: priority || "Medium"
        });
        await ticket.save();
        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   GET /api/tickets
// @desc    Get current user's tickets
// @access  Private
router.get("/", auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   GET /api/tickets/all
// @desc    Get all tickets (Admin only)
// @access  Private (Admin)
router.get("/all", adminAuth, async (req, res) => {
    try {
        const tickets = await Ticket.find().populate("user", ["name", "email"]).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   PUT /api/tickets/:id
// @desc    Update ticket status (Admin only)
// @access  Private (Admin)
router.put("/:id", adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(ticket);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
