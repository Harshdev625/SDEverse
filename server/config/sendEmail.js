import { nodemailer } from 'nodemailer';

const sendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
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
}

export default sendEmail;