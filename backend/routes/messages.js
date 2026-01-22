const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const sendEmail = require("../utils/sendEmail");

// @route   POST /api/messages
// @desc    Submit a new contact message
// @access  Public
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ msg: "Please enter all fields" });
        }

        const newMessage = new Message({
            name,
            email,
            subject,
            message,
        });

        const savedMessage = await newMessage.save();

        // Email to Admin
        const adminHtml = `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Email to Admin
        sendEmail({
            to: process.env.EMAIL_USER,
            subject: `New Message from ${name}: ${subject}`,
            html: adminHtml
        }).catch(emailErr => {
            console.error("Failed to send admin email:", emailErr);
        });

        // Email to User
        const userHtml = `
            <h3>Thank you for contacting Shield Support!</h3>
            <p>Dear ${name},</p>
            <p>We have received your message regarding "<strong>${subject}</strong>". Our team will get back to you shortly.</p>
            <br>
            <p>Best Regards,</p>
            <p>Shield Support Team</p>
        `;

        // Email to User
        sendEmail({
            to: email,
            subject: "Message Received - Shield Support",
            html: userHtml
        }).catch(emailErr => {
            console.error("Failed to send user email:", emailErr);
        });

        res.status(201).json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   GET /api/messages
// @desc    Get all messages (Admin only)
// @access  Public (Should be protected in prod, but keeping simple for this iteration as per existing patterns)
router.get("/", async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Public
router.delete("/:id", async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }

        await message.deleteOne();
        res.json({ msg: "Message removed" });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Message not found" });
        }
        res.status(500).send("Server Error");
    }
});

module.exports = router;
