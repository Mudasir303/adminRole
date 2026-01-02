const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// @route   POST /api/subscribers
// @desc    Subscribe to newsletter
// @access  Public
router.post("/", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: "Please enter an email address" });
    }

    try {
        // Check if already subscribed
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            return res.status(400).json({ msg: "This email is already subscribed" });
        }

        subscriber = new Subscriber({
            email,
        });

        await subscriber.save();

        res.status(201).json({ msg: "Subscribed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private (Admin) - simplified for now, usually protected
router.get("/", async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        res.json(subscribers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   DELETE /api/subscribers/:id
// @desc    Delete a subscriber
// @access  Private (Admin)
router.delete("/:id", async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);

        if (!subscriber) {
            return res.status(404).json({ msg: "Subscriber not found" });
        }

        await subscriber.deleteOne();

        res.json({ msg: "Subscriber removed" });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Subscriber not found" });
        }
        res.status(500).send("Server Error");
    }
});

module.exports = router;
