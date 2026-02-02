const nodemailer = require('nodemailer');
const { google } = require('googleapis');

/**
 * Send email utility
 * Uses Google Gmail API (OAuth2) in production (Render) - Direct HTTP API
 * Uses standard Nodemailer SMTP in development (Local)
 */
const sendEmail = async (options) => {
    // 1. PRIMARY STRATEGY: Direct Gmail API (Google Console API)
    // We use this if OAuth2 credentials are provided, as requested.
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
        try {
            console.log('--- Attempting to send email via Google Gmail API ---');

            const OAuth2 = google.auth.OAuth2;
            const oauth2Client = new OAuth2(
                process.env.GMAIL_CLIENT_ID,
                process.env.GMAIL_CLIENT_SECRET,
                process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
            );

            oauth2Client.setCredentials({
                refresh_token: process.env.GMAIL_REFRESH_TOKEN
            });

            const sentMessage = await sendGmailApi(oauth2Client, options);
            console.log('SUCCESS: Email sent via Gmail API. ID:', sentMessage.id);
            return;
        } catch (error) {
            console.error('CRITICAL: Gmail API failed:', error.message);
            // If the error is specifically about credentials, log it clearly
            if (error.message.includes('invalid_grant') || error.message.includes('Refresh token is invalid')) {
                console.error('ERROR: Your GMAIL_REFRESH_TOKEN appears to be invalid or expired. Please regenerate it in Google Cloud Console.');
            }

            // Fallback to SMTP only if API fails and SMTP credentials exist
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new Error(`Gmail API failed and no SMTP fallback available: ${error.message}`);
            }
            console.log('Falling back to SMTP delivery...');
        }
    }

    // 2. FALLBACK STRATEGY: Nodemailer SMTP (Traditional)
    try {
        console.log('Attempting to send email via SMTP...');
        const transporter = createSmtpTransporter();

        const message = {
            from: `"${process.env.FROM_NAME || 'Yashoda Bhavan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        const info = await transporter.sendMail(message);
        console.log('SUCCESS: Message sent via SMTP. ID:', info.messageId);
    } catch (error) {
        console.error('SMTP Email Error:', error.message);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

/**
 * Helper to construct and send raw MIME message via Gmail API
 */
async function sendGmailApi(auth, options) {
    const gmail = google.gmail({ version: 'v1', auth });

    // Construct MIME message manually
    // Headers need to be properly formatted and encoded
    const subject = options.subject;
    const from = `"${process.env.FROM_NAME || 'Yashoda Bhawan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`;
    const to = options.email;
    const body = options.html || options.message;
    const contentType = options.html ? 'text/html' : 'text/plain';

    const str = [
        `Content-Type: ${contentType}; charset="UTF-8"`,
        'MIME-Version: 1.0',
        `To: ${to}`,
        `From: ${from}`,
        `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
        '',
        body
    ].join('\n');

    // Base64URL encode the message
    const raw = Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: raw,
        },
    });

    return res.data;
}

// Helper function for SMTP transporter
function createSmtpTransporter() {
    // If OAuth credentials exist, try standardized Gmail SMTP
    if (process.env.GMAIL_CLIENT_ID && process.env.EMAIL_USER) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            },
        });
    }

    // Default to basic usage (Development)
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
