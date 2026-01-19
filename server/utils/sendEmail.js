const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer with generic SMTP configuration.
 * Supports a mock/development mode for console logging.
 */
const sendEmail = async (options) => {
    // Configuration from environment variables
    const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Do not fail on invalid certs (common for custom SMTP)
            rejectUnauthorized: false
        }
    };

    // Only intercept in console if explicitly set to 'mock' or if credentials are missing
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';
    const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (isMockMode || !hasCredentials) {
        console.log('--------------------------------------------------');
        console.log(`📧 [${isMockMode ? 'MOCK' : 'DEVELOPMENT'}] Email Intercepted:`);
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('--------------------------------------------------');

        if (!hasCredentials && !isMockMode) {
            console.warn('⚠️  Warning: SMTP credentials missing. Emails are being logged to console instead of sent.');
        }

        return { messageId: 'mock-id' };
    }

    try {
        // 1. Create a transporter
        const transporter = nodemailer.createTransport(config);

        // 2. Define email options
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Yashoda Bhawan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        // 3. Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error);
        // Throw a descriptive error for the frontend
        const errorMessage = error.message || 'Failed to send email via SMTP service';
        throw new Error(errorMessage);
    }
};

module.exports = sendEmail;
