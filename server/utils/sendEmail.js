const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    // If we're in development or don't have a valid Resend API key, log to console
    const isDev = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('your_api_key');

    if (isDev) {
        console.log('--------------------------------------------------');
        console.log('📧 [DEVELOPMENT MODE] Email Intercepted:');
        console.log(`To:      ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        if (options.html) console.log('HTML content provided.');
        console.log('--------------------------------------------------');
        // Return a mock response that looks like Resend's
        return { id: 'dev-mode-mock-id' };
    }

    try {
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
        const fromName = process.env.FROM_NAME || 'Yashoda Bhawan';

        console.log(`Attempting to send email via Resend from: ${fromName} <${fromEmail}> to ${options.email}`);

        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(error.message);
        }

        console.log('Email sent successfully:', data.id);
        return data;
    } catch (err) {
        console.error('Email sending failed:', err);
        throw err;
    }
};

module.exports = sendEmail;
