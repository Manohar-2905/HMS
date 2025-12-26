const express = require('express');
const router = express.Router();
const { generateInvoice } = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:id', protect, admin, generateInvoice);

module.exports = router;
