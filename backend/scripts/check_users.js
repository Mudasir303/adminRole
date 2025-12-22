const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminRole');
        console.log('MongoDB connected');

        const users = await User.find({});
        console.log('--- USERS ---');
        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            users.forEach(u => {
                console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.password.substring(0, 20)}...`);
            });
        }
        console.log('-------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
