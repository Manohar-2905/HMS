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

    // Use 'service' shorthand if host is gmail, as it often works better in cloud environments
    const config = {
        service: smtpHost.includes('gmail.com') ? 'gmail' : undefined,
        host: smtpHost.includes('gmail.com') ? undefined : smtpHost,
        port: smtpHost.includes('gmail.com') ? undefined : smtpPort,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false,
            // Explicitly set servername for SNI
            servername: smtpHost
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 30000,     // 30 seconds
    };

    console.log(`Debug: Attempting email via ${config.service ? 'Service="gmail"' : 'Host="' + smtpHost + '"'}`);

    // Only intercept in console if explicitly set to 'mock'
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';
    const hasCredentials = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

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
        console.log('--- SMTP Sending Process Started (30s limit) ---');

        // 1. Create a transporter
        const transporter = nodemailer.createTransport(config);

        // 2. Wrap everything in a timeout to prevent 502 hangs
        return await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('SMTP Connection/Sending timed out (30s limit)'));
            }, 30000);

            console.log('Step 1: Verifying SMTP Connection...');
            transporter.verify(async (error, success) => {
                if (error) {
                    clearTimeout(timeoutId);
                    console.error('Step 1 Failed: Connection verification error:', error);
                    return reject(new Error(`SMTP Verification Failed: ${error.message}`));
                }

                console.log('Step 2: Connection verified. Defining mail options...');
                const mailOptions = {
                    from: `"${process.env.FROM_NAME || 'Yashoda Bhawan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
                    to: options.email,
                    subject: options.subject,
                    text: options.message,
                    html: options.html,
                };

                console.log('Step 3: Attempting to send mail...');
                transporter.sendMail(mailOptions, (sendError, info) => {
                    clearTimeout(timeoutId);
                    if (sendError) {
                        console.error('Step 3 Failed: Error sending mail:', sendError);
                        return reject(new Error(`SMTP Send Failed: ${sendError.message}`));
                    }
                    console.log('Step 4: Email sent successfully!', info.messageId);
                    resolve(info);
                });
            });
        });
    } catch (error) {
        console.error('--- SMTP Process Failed ---');
        console.error('Detailed Error:', error);
        throw error;
    }
};

module.exports = sendEmail;
