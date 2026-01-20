const nodemailer = require('nodemailer');
const { google } = require('googleapis');

/**
 * Hybrid Email Utility:
 * 1. Uses Gmail API (OAuth2) if GOOGLE_REFRESH_TOKEN is provided (Best for Production/Render).
 * 2. Falls back to Standard SMTP if Refresh Token is missing (Best for Local Development).
 */
const sendEmail = async (options) => {
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';

    // Check for Gmail API / OAuth2 credentials
    const useOAuth2 = !!(
        process.env.GMAIL_CLIENT_ID &&
        process.env.GMAIL_CLIENT_SECRET &&
        process.env.GMAIL_REFRESH_TOKEN
    );

    // Diagnostic Logs
    console.log('--- Email Service Check ---');
    console.log(`Environment: ${useOAuth2 ? 'PRODUCTION (GMAIL API)' : 'DEVELOPMENT (SMTP)'}`);
    console.log(`Mock Mode: ${isMockMode}`);
    console.log('---------------------------');

    if (isMockMode) {
        console.log('📧 [MOCK MODE] Email Intercepted:');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('---------------------------------');
        return { messageId: 'mock-id' };
    }

    let transporter;

    if (useOAuth2) {
        // --- OAUTH2 (GMAIL API) CONFIG ---
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER || process.env.EMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN
            }
        });
    } else {
        // --- STANDARD SMTP CONFIG ---
        const smtpHost = (process.env.SMTP_HOST || '').trim();
        const smtpPort = parseInt(process.env.SMTP_PORT || '465');
        const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials missing (Both OAuth2 and SMTP).');
        }

        transporter = nodemailer.createTransport({
            host: smtpHost || (smtpPort === 465 ? 'smtp.gmail.com' : undefined),
            port: smtpPort,
            secure: isSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                servername: smtpHost || 'smtp.gmail.com'
            }
        });
    }

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Yashoda Bhawan'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        console.log(`Step 1: Attempting to send via ${useOAuth2 ? 'OAuth2' : 'SMTP'}...`);
        const info = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Email sending timed out (30s limit)'));
            }, 30000);

            transporter.sendMail(mailOptions, (error, result) => {
                clearTimeout(timeoutId);
                if (error) return reject(error);
                resolve(result);
            });
        });

        console.log('Step 2: Email sent successfully!', info.messageId);
        return info;
    } catch (error) {
        console.error('--- Email Sending Failed ---');
        console.error('Error Details:', error.message);
        throw error;
    }
};

module.exports = sendEmail;
