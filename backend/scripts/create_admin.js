const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminRole');
        console.log('MongoDB connected');

        const email = 'admin@admin.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let admin = await User.findOne({ email });

        if (admin) {
            admin.password = hashedPassword;
            admin.role = 'admin';
            await admin.save();
            console.log('Admin user updated.');
        } else {
            admin = await User.create({
                name: 'System Admin',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created.');
        }

        console.log(`\nSUCCESS! You can now login with:\nEmail: ${email}\nPassword: ${password}\n`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
