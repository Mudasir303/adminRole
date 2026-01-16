const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Verify connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            console.log("SMTP Connection Error:", error);
        } else {
            console.log("SMTP Server is ready to take our messages");
        }
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Shield Support'} <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments, // Add this line
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
