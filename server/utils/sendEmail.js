const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter (using services or SMTP)
    // For now, assuming standard SMTP or Gmail from ENV
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Helps in some environments
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Yashoda Bhawan'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // HTML version
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
