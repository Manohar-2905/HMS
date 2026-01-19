const sendpulse = require('sendpulse-api');

const sendEmail = async (options) => {
    const API_ID = process.env.SENDPULSE_API_ID;
    const API_SECRET = process.env.SENDPULSE_API_SECRET;
    const TOKEN_STORAGE = "/tmp/"; // You can change this path if needed

    // If we're in development or don't have SendPulse credentials, log to console
    const isDev = process.env.NODE_ENV === 'development' || !API_ID || !API_SECRET;

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
        return new Promise((resolve, reject) => {
            sendpulse.init(API_ID, API_SECRET, TOKEN_STORAGE, (token) => {
                if (token && token.is_error) {
                    console.error('SendPulse Init Error:', token);
                    return reject(new Error('SendPulse initialization failed'));
                }

                const emailBody = {
                    html: options.html,
                    text: options.message,
                    subject: options.subject,
                    from: {
                        name: process.env.FROM_NAME || 'Yashoda Bhawan',
                        email: process.env.FROM_EMAIL,
                    },
                    to: [
                        {
                            email: options.email,
                        },
                    ],
                };

                sendpulse.smtpSendMail((data) => {
                    if (data && data.is_error) {
                        console.error('SendPulse SMTP Error:', data);
                        const errorMessage = data.message || (data.data && data.data.message) || 'Error sending email via SendPulse';
                        return reject(new Error(errorMessage));
                    }
                    console.log('Email sent successfully via SendPulse:', data);
                    resolve(data);
                }, emailBody);
            });
        });
    } catch (err) {
        console.error('Email sending failed:', err);
        throw err;
    }
};

module.exports = sendEmail;
