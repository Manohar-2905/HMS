const nodemailer = require('nodemailer');
const { google } = require('googleapis');

/**
 * Hybrid Email Utility:
 * - Production (Render): Uses Gmail REST API (HTTPS/Port 443) which bypasses SMTP blocks.
 * - Local: Uses Standard SMTP for ease of development.
 */
const sendEmail = async (options) => {
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';

    // Check for Gmail API / OAuth2 credentials
    const useGmailAPI = !!(
        process.env.GMAIL_CLIENT_ID &&
        process.env.GMAIL_CLIENT_SECRET &&
        process.env.GMAIL_REFRESH_TOKEN
    );

    console.log('--- Email Service Diagnostics ---');
    console.log(`Mode: ${useGmailAPI ? 'Gmail REST API (HTTPS)' : 'Standard SMTP'}`);
    console.log(`Mock: ${isMockMode}`);
    console.log('---------------------------------');

    if (isMockMode) {
        console.log('📧 [MOCK] Email Intercepted:');
        console.log(`To: ${options.email}, Subject: ${options.subject}`);
        return { messageId: 'mock-id' };
    }

    // Common Email Headers/Body
    const fromName = process.env.FROM_NAME || 'Yashoda Bhawan';
    const fromEmail = process.env.FROM_EMAIL || process.env.GMAIL_USER || process.env.EMAIL_USER;
    const recipient = options.email;
    const subject = options.subject;
    const message = options.message;
    const html = options.html;

    if (useGmailAPI) {
        // --- PRODUCTION: GMAIL REST API (HTTPS) ---
        try {
            console.log('Step 1: Initializing Gmail API Client...');
            const oAuth2Client = new google.auth.OAuth2(
                process.env.GMAIL_CLIENT_ID,
                process.env.GMAIL_CLIENT_SECRET,
                'https://developers.google.com/oauthplayground'
            );

            oAuth2Client.setCredentials({
                refresh_token: process.env.GMAIL_REFRESH_TOKEN
            });

            const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

            // Construct RFC 2822 message
            const str = [
                `From: "${fromName}" <${fromEmail}>`,
                `To: ${recipient}`,
                `Subject: ${subject}`,
                'Content-Type: text/html; charset=utf-8',
                'MIME-Version: 1.0',
                '',
                html || message
            ].join('\n');

            // Base64url encode the message
            const encodedMessage = Buffer.from(str)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            console.log('Step 2: Sending via Gmail HTTPS API...');
            const res = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                },
            });

            console.log('Step 3: Gmail API Success!', res.data.id);
            return { messageId: res.data.id };
        } catch (error) {
            console.error('❌ Gmail API Error:', error.message);
            throw new Error(`Gmail API Failed: ${error.message}`);
        }
    } else {
        // --- LOCAL: STANDARD SMTP ---
        console.log('Step 1: Configuring SMTP Transporter...');
        const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('SMTP credentials missing.');
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: isSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                servername: smtpHost
            }
        });

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: recipient,
            subject: subject,
            text: message,
            html: html,
        };

        try {
            console.log('Step 2: Sending via local SMTP...');
            const info = await transporter.sendMail(mailOptions);
            console.log('Step 3: SMTP Success!', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ SMTP Error:', error.message);
            throw error;
        }
    }
};

module.exports = sendEmail;
