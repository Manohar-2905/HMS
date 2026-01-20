const nodemailer = require('nodemailer');
const { google } = require('googleapis');

/**
 * Send email utility
 * Uses Google Gmail API (OAuth2) in production (Render)
 * Uses standard Nodemailer SMTP in development (Local)
 */
const sendEmail = async (options) => {
    let transporter;

    if (process.env.NODE_ENV === 'production' && process.env.GMAIL_CLIENT_ID) {
        // PRODUCTION: Google Gmail API Implementation
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        try {
            const accessTokenResponse = await oauth2Client.getAccessToken();
            
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.GMAIL_CLIENT_ID,
                    clientSecret: process.env.GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                    accessToken: accessTokenResponse.token,
                },
            });
        } catch (error) {
            console.error('Failed to create OAuth2 transporter, falling back to SMTP:', error.message);
            // Fallback to regular SMTP if OAuth fails but credentials exist
            transporter = createSmtpTransporter();
        }
    } else {
        // DEVELOPMENT or fallback: Existing Nodemailer SMTP Implementation
        transporter = createSmtpTransporter();
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Yashoda Bhawan'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

// Helper function for SMTP transporter
function createSmtpTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

module.exports = sendEmail;
