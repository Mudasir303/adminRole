require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const resetAdmin = async () => {
    try {
        // Connect
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/adminrole");
        console.log("MongoDB Connected");

        const email = "admin@example.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOne({ email });

        if (user) {
            user.password = hashedPassword;
            user.role = "admin";
            await user.save();
            console.log(`Updated existing user: ${email} with password: ${password}`);
        } else {
            await User.create({
                name: "Admin User",
                email,
                password: hashedPassword,
                role: "admin"
            });
            console.log(`Created new admin: ${email} with password: ${password}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetAdmin();
