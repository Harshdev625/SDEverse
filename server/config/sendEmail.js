const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    
        await transporter.sendMail({
            from: `"No Reply" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: subject,
            text: message,
        });
    } catch (error) {
        throw new Error('Email could not be sent');
    }
}

module.exports = sendEmail;