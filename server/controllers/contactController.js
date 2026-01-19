const sendEmail = require('../utils/sendEmail');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res) => {
    const { name, email, phone, message } = req.body;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #f59e0b; text-align: center;">New Room Enquiry</h2>
            <p>You have received a new enquiry from the Yashoda Bhavan website.</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                    <td>${name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                    <td>${phone}</td>
                </tr>
            </table>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-weight: bold;">Message:</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
                ${message}
            </div>
            <p style="margin-top: 20px; font-size: 0.8em; color: #777; text-align: center;">
                This message was sent from the contact form on Yashoda Bhavan.
            </p>
        </div>
    `;

    try {
        await sendEmail({
            email: process.env.ADMIN_EMAIL,
            subject: `New enquiry for Yashoda bhavan room from ${name}`,
            message: `New enquiry from ${name} (${email}): ${message}`,
            html,
        });
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
};

module.exports = { sendContactEmail };
