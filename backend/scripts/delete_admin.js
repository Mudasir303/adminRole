const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const deleteAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adminRole');
        console.log('MongoDB connected');

        rl.question('Enter the email of the admin you want to delete: ', async (email) => {
            try {
                const userToDelete = await User.findOne({ email });

                if (!userToDelete) {
                    console.log('User not found.');
                    process.exit(1);
                }

                if (userToDelete.role !== 'admin') {
                    console.log('This user is not an admin.');
                    process.exit(1);
                }

                // Check total number of admins
                const adminCount = await User.countDocuments({ role: 'admin' });

                if (adminCount <= 1) {
                    console.log('ERROR: Cannot delete the only remaining admin. You must create another admin before deleting this one.');
                    process.exit(1);
                }

                console.log(`\nWARNING: You are about to delete admin: ${userToDelete.name} (${userToDelete.email})`);
                rl.question('Are you sure? (yes/no): ', async (answer) => {
                    if (answer.toLowerCase() === 'yes') {
                        await User.findByIdAndDelete(userToDelete._id);
                        console.log('Admin deleted successfully.');
                    } else {
                        console.log('Deletion cancelled.');
                    }
                    process.exit();
                });

            } catch (err) {
                console.error(err);
                process.exit(1);
            }
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deleteAdmin();
