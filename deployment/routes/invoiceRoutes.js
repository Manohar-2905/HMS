const express = require('express');
const router = express.Router();
const { getInvoice } = require('../controllers/invoiceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:userId', protect, admin, getInvoice);

module.exports = router;
