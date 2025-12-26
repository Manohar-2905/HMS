const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const User = require('../models/User');

// @desc    Generate Invoice PDF
// @route   GET /api/invoices/:id
// @access  Private/Admin
const generateInvoice = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;

        page.drawText('Hostel Invoice', {
            x: 50,
            y: height - 50,
            size: 24,
            font: font,
            color: rgb(0, 0, 0),
        });

        const textLines = [
            `Date: ${new Date().toLocaleDateString()}`,
            `Name: ${user.name}`,
            `Email: ${user.email}`,
            `Room Type: ${user.roomType || 'N/A'}`,
            `Total Amount: $${user.totalAmount}`,
            `Paid Amount: $${user.paidAmount}`,
            `Remaining Amount: $${user.remainingAmount}`,
        ];

        let yConfig = height - 100;
        textLines.forEach(line => {
            page.drawText(line, {
                x: 50,
                y: yConfig,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
            yConfig -= 20;
        });

        const pdfBytes = await pdfDoc.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${user.name}.pdf`,
            'Content-Length': pdfBytes.length,
        });

        res.end(pdfBytes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating invoice' });
    }
};

module.exports = { generateInvoice };
