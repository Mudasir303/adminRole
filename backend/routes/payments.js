const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

// @route   POST /api/payments
// @desc    Process a new payment (Mock)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { amount, plan } = req.body;

        // Simulate payment processing
        const transactionId = 'TXN_' + Date.now();

        const newPayment = new Payment({
            user: req.user.id,
            amount,
            plan,
            status: 'Completed',
            transactionId
        });

        const payment = await newPayment.save();
        res.json(payment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payments
// @desc    Get current user's payments
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payments/all
// @desc    Get all payments (Admin only)
// @access  Private (Admin check needed if not using adminAuth middleware)
router.get('/all', auth, async (req, res) => {
    // In a real app, check for admin role here or use middleware
    try {
        const payments = await Payment.find().populate('user', ['name', 'email']).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
