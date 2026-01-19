const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If we're in development, log to console instead of sending
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        console.log('--------------------------------------------------');
        console.log('📧 [DEVELOPMENT MODE] Email Intercepted:');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        if (options.html) console.log('HTML content provided.');
        console.log('--------------------------------------------------');
        return { messageId: 'dev-mode-mock-id' };
    }

    try {
        // Create a transporter using generic SMTP settings
        // These can be used with Gmail, Goforhost, or any other SMTP provider
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false // Often needed for custom SMTP providers
            }
        });

        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Yashoda Bhawan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (err) {
        console.error('Email sending failed:', err);
        throw err;
    }
};

module.exports = sendEmail;
