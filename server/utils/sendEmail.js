const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer with generic SMTP configuration.
 * Supports a mock/development mode for console logging.
 */
const sendEmail = async (options) => {
    // Configuration from environment variables
    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = parseInt(process.env.SMTP_PORT || '465'); // Default to 465 for SSL
    const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    const config = {
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
    };

    console.log(`Debug: Attempting email via Host="${smtpHost}" Port=${smtpPort} (Secure=${isSecure})`);

    // Only intercept in console if explicitly set to 'mock'
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';
    const hasCredentials = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    console.log(`Debug: EMAIL_SERVICE_MODE="${process.env.EMAIL_SERVICE_MODE}"`);
    console.log(`Debug: hasCredentials=${hasCredentials}`);

    if (isMockMode) {
        console.log('--------------------------------------------------');
        console.log('📧 [MOCK MODE] Email Intercepted:');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('--------------------------------------------------');
        return { messageId: 'mock-id' };
    }

    if (!isMockMode && hasCredentials && !smtpHost) {
        const errorMsg = 'SMTP_HOST is missing in environment variables. Cannot send real email.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
    }

    if (!hasCredentials) {
        const errorMsg = 'SMTP credentials missing. Please configure EMAIL_USER and EMAIL_PASS in your .env file.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
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
