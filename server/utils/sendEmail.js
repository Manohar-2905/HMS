const sendpulse = require('sendpulse-api');

const sendEmail = async (options) => {
    const API_ID = process.env.SENDPULSE_API_ID;
    const API_SECRET = process.env.SENDPULSE_API_SECRET;
    const TOKEN_STORAGE = "/tmp/";

    // Only intercept in console if explicitly set to 'mock' or if in development AND credentials are missing
    // We want to throw an error if the user expects it to send but it can't.
    const isMockMode = process.env.EMAIL_SERVICE_MODE === 'mock';

    if (isMockMode) {
        console.log('--------------------------------------------------');
        console.log('📧 [MOCK MODE] Email Intercepted:');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('--------------------------------------------------');
        return { messageId: 'mock-id' };
    }

    if (!API_ID || !API_SECRET) {
        const errorMsg = 'SendPulse API credentials (ID/SECRET) are missing. Email cannot be sent.';
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
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
                        name: (process.env.FROM_NAME || 'Yashoda Bhawan').trim(),
                        email: (process.env.FROM_EMAIL || '').trim(),
                    },
                    to: [
                        {
                            email: (options.email || '').trim(),
                        },
                    ],
                };

                console.log(`📤 Sending email via SendPulse FROM: ${emailBody.from.email} TO: ${emailBody.to[0].email}`);

                sendpulse.smtpSendMail((data) => {
                    // SendPulse might return data.is_error = true OR an error_code within the data object
                    if (data && (data.is_error || data.error_code)) {
                        console.error('SendPulse SMTP Error:', data);
                        const errorMessage = data.message || (data.data && data.data.message) || `SendPulse Error (Code: ${data.error_code})`;
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
