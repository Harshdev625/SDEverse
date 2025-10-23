const { Resend } = require('resend');

const sendEmail = async (email, subject, message) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
    
        await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            text: message,
        });
    } catch (error) {
        throw new Error(`Email could not be sent: ${error.message}`);
    }
}

module.exports = sendEmail;