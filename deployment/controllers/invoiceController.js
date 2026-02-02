const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const https = require('https');

// @desc    Generate Invoice PDF
// @route   GET /api/invoice/:userId
// @access  Private/Admin
const getInvoice = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const doc = new PDFDocument({
            size: 'A4',
            margin: 30
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${user.id}.pdf`);

        doc.pipe(res);

        // --- COLORS ---
        const BLACK = '#000000';
        const GOLD = '#f59e0b';
        const LIGHT_GREY = '#f3f4f6';
        const PURPLE_FOOTER = '#2e2344';
        const WHITE = '#ffffff';

        // --- HEADER ---
        doc.rect(0, 0, 600, 85).fill(BLACK);

        // Logo
        const logoPath = path.join(__dirname, '../../client/public/logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 30, 10, { width: 65 });
        } else {
            doc.fillColor(GOLD).fontSize(20).text('YB', 30, 30);
        }

        doc.fillColor(GOLD).fontSize(22).font('Helvetica-Bold').text('Registration Form', 130, 20);
        doc.fillColor(WHITE).fontSize(9).font('Helvetica').text('LAKHEY, HAZARIBAGH : 825301', 130, 48);
        doc.text('hazaribaghgirlshostle.in', 130, 60);

        // Date Box
        const { date } = req.query;
        // Use provided date or today's date, format as DD/MM/YYYY
        const displayDate = date ? new Date(date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

        doc.fillColor(WHITE).fontSize(12).font('Helvetica-Bold').text('Date:', 440, 25);
        doc.rect(480, 20, 90, 20).fill(WHITE);
        doc.fillColor(BLACK).fontSize(10).text(displayDate, 485, 26);


        // --- FETCH PROFILE IMAGE HELPER ---
        const fetchImage = (url) => {
            return new Promise((resolve, reject) => {
                https.get(url, (response) => {
                    const chunks = [];
                    response.on('data', (chunk) => chunks.push(chunk));
                    response.on('end', () => resolve(Buffer.concat(chunks)));
                    response.on('error', reject);
                });
            });
        };

        // --- PHOTO BOX ---
        const photoX = 470;
        const photoY = 60;
        const photoW = 100;
        const photoH = 100;

        // Draw Border
        doc.rect(photoX, photoY, photoW, photoH).lineWidth(2).stroke(BLACK);

        if (user.photo && user.photo.startsWith('http')) {
            try {
                const imgBuffer = await fetchImage(user.photo);
                // Clip to box to ensure perfect fit without overflow
                doc.save();
                doc.rect(photoX, photoY, photoW, photoH).clip();
                // Use 'cover' to crop images to same ratio as box
                doc.image(imgBuffer, photoX, photoY, { cover: [photoW, photoH], align: 'center', valign: 'center' });
                doc.restore();
            } catch (e) {
                // Ignore
            }
        }

        // --- HELPER FOR FIELDS ---
        const fieldStyle = (label, value, y, x, labelW, valW) => {
            doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text(label, x, y);
            // Background for value - slightly taller box
            doc.rect(x + labelW, y - 6, valW, 20).fill(LIGHT_GREY);
            doc.fillColor(BLACK).font('Helvetica').text(value || '', x + labelW + 5, y);
        };

        let currentY = 110;

        // --- PERSONAL INFORMATION ---
        doc.fillColor(BLACK).fontSize(11).font('Helvetica-Bold').text('PERSONAL INFORMATION', 40, currentY);
        doc.rect(40, currentY + 14, 180, 1).fill(BLACK);
        currentY += 35; // Increased gap

        // Row 1: Full Name
        fieldStyle('Full Name :', user.name, currentY, 40, 60, 350);
        currentY += 32; // Increased spacing

        // Row 2: Address
        fieldStyle('Address :', user.address, currentY, 40, 60, 350);
        currentY += 32;

        // Photo ends at Y = 60 + 100 = 160. 
        // Current Y is ~147. Next row at 169. Safe to use full width or 2 columns now.

        // Row 3: DOB | Mother's Name
        const col2X = 300;
        fieldStyle('Date of Birth :', user.dob ? new Date(user.dob).toLocaleDateString() : '', currentY, 40, 70, 150);
        fieldStyle("mother's name", user.motherName, currentY, col2X, 85, 160);
        currentY += 32;

        // Row 4: Email | Mother's Mob
        fieldStyle('Email :', user.email, currentY, 40, 70, 150);
        fieldStyle("mother's mob no.", user.motherPhone, currentY, col2X, 85, 160);
        currentY += 32;

        // Row 5: Father's Name | Frequent Visitor 1
        fieldStyle("Father's name", user.fatherName, currentY, 40, 75, 145);
        const v1 = user.visitors && user.visitors[0] ? user.visitors[0] : '';
        doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text("Frequent", col2X, currentY - 5);
        doc.text("visitor's name", col2X, currentY + 7);
        doc.font('Helvetica-Bold').text("1", col2X + 75, currentY);
        doc.rect(col2X + 85, currentY - 6, 160, 20).fill(LIGHT_GREY);
        doc.fillColor(BLACK).font('Helvetica').text(v1, col2X + 90, currentY);
        currentY += 32;

        // Row 6: Father's Occ | Frequent Visitor 2
        fieldStyle("Father's occupation", user.fatherOccupation, currentY, 40, 95, 125);
        const v2 = user.visitors && user.visitors[1] ? user.visitors[1] : '';
        doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text("2", col2X + 75, currentY);
        doc.rect(col2X + 85, currentY - 6, 160, 20).fill(LIGHT_GREY);
        doc.fillColor(BLACK).font('Helvetica').text(v2, col2X + 90, currentY);
        currentY += 32;

        // Row 7: Father's mobile No | Frequent Visitor 3
        fieldStyle("Father's mobile no.", user.fatherPhone, currentY, 40, 95, 125);
        const v3 = user.visitors && user.visitors[2] ? user.visitors[2] : '';
        doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text("3", col2X + 75, currentY);
        doc.rect(col2X + 85, currentY - 6, 160, 20).fill(LIGHT_GREY);
        doc.fillColor(BLACK).font('Helvetica').text(v3, col2X + 90, currentY);
        currentY += 32;

        // Row 8: Girl's Aadhar | Frequent Visitor 4
        fieldStyle("Girl's aadhar no.", user.aadharNo, currentY, 40, 95, 125);
        const v4 = user.visitors && user.visitors[3] ? user.visitors[3] : '';
        doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text("4", col2X + 75, currentY);
        doc.rect(col2X + 85, currentY - 6, 160, 20).fill(LIGHT_GREY);
        doc.fillColor(BLACK).font('Helvetica').text(v4, col2X + 90, currentY);
        currentY += 40; // Extra gap before header


        // --- ACADEMIC DETAILS ---
        doc.fillColor(BLACK).fontSize(11).font('Helvetica-Bold').text('ACADEMIC DETAILS', 40, currentY);
        doc.rect(40, currentY + 14, 180, 1).fill(BLACK);
        currentY += 35;

        // University Only (Removed Reg/Emp ID)
        doc.fillColor(BLACK).fontSize(8).font('Helvetica-Bold').text("University/ institution/", 40, currentY - 5);
        doc.text("college/online details", 40, currentY + 7);

        doc.rect(130, currentY - 6, 410, 25).fill(LIGHT_GREY);
        doc.fillColor(BLACK).fontSize(9).font('Helvetica').text(user.university || '', 135, currentY + 2);

        currentY += 60; // larger gap to Declaration

        // --- DECLARATION ---

        const declBoxY = currentY;
        // Rounded-ish declaration box - image uses rounded corners
        doc.roundedRect(40, declBoxY, 510, 70, 20).fill(GOLD);

        doc.fillColor(BLACK).fontSize(10).font('Helvetica-Bold').text('Declaration', 270, declBoxY + 10);
        doc.font('Helvetica-Bold').fontSize(7.5).text(
            'I, the undersigned, hereby declare that the information provided by me in this form is true, complete, and accurate to the best of my knowledge. I understand that any false, misleading, or incomplete information may result in disciplinary action, including the revocation of my admission to Yashoda Bhawan Hostel. I agree to abide by all the rules and regulations of Yashoda Bhawan Hostel during my stay.',
            60, declBoxY + 25, { width: 470, align: 'center', lineGap: 3 }
        );

        // --- SIGNATURES ---
        currentY = declBoxY + 90; // Spacing after declaration

        // Guardian on Left
        doc.fillColor(BLACK).fontSize(9).font('Helvetica-Bold').text('Signature of Local Guardian:', 60, currentY);
        doc.text('Date:', 60, currentY + 30);

        // Girl on Right
        doc.text('Signature of Girl:', 380, currentY);
        doc.text('Date:', 380, currentY + 30);

        // Girl's Contact Number - Aligned to right side
        // Label at 350, Box at 450? Or Label at 300? 
        // Image shows "Girl's contact number" label then box.
        // Let's place it under the Girl's signature/Date area
        const contactY = currentY + 60;
        doc.text("Girl's contact number", 320, contactY + 5);
        doc.rect(425, contactY, 130, 20).fill(LIGHT_GREY);
        doc.fillColor(BLACK).font('Helvetica').text(user.phone || '', 430, contactY + 6);

        // --- BOTTOM MESSAGE ---
        // Aligned to the Right side as per the image
        currentY = contactY + 35;
        const msgX = 320;

        // THANK YOU (Black) FOR REGISTRATION (Gold)
        doc.fillColor(BLACK).fontSize(10).font('Helvetica-Bold').text('THANK YOU', msgX, currentY, { continued: true });
        doc.fillColor(GOLD).text(' FOR REGISTRATION');

        doc.fillColor(BLACK).fontSize(7).font('Helvetica').text(
            'Before submitting the form please turn the page and see all the rule and regulation. If you agree then only submit the form and stay peacefully.',
            msgX,
            currentY + 15,
            { width: 230, align: 'left', lineGap: 1 }
        );


        // --- FOOTER BAR ---
        doc.rect(0, 780, 600, 40).fill('#2e2344'); // Purple footer
        doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('A STAY FOR PRINCESS FOR BETTER FUTURE', 0, 792, {
            width: 595,
            align: 'center'
        });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating invoice' });
    }
};

module.exports = { getInvoice };


