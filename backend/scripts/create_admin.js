const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminRole');
        console.log('MongoDB connected');

        rl.question('Enter Admin Name: ', (name) => {
            rl.question('Enter Admin Email: ', (email) => {
                rl.question('Enter Admin Password: ', async (password) => {
                    try {
                        let admin = await User.findOne({ email });

                        if (admin) {
                            console.log(`\nUser with email ${email} already exists.`);
                            if (admin.role === 'admin') {
                                console.log('This user is already an admin.');
                            } else {
                                console.log('Updating role to admin...');
                                admin.role = 'admin';
                                await admin.save();
                                console.log('User role updated to admin.');
                            }
                        } else {
                            const hashedPassword = await bcrypt.hash(password, 10);
                            admin = await User.create({
                                name,
                                email,
                                password: hashedPassword,
                                role: 'admin'
                            });
                            console.log('\nNew Admin user created successfully.');
                        }

                        console.log(`\nSummary:\nName: ${name || admin.name}\nEmail: ${email}\nRole: admin\n`);
                        process.exit();
                    } catch (err) {
                        console.error('Error creating admin:', err.message);
                        process.exit(1);
                    }
                });
            });
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
