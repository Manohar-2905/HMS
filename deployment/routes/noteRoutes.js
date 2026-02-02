const express = require('express');
const router = express.Router();
const { getNotes, createNote, deleteNote, approveNote, proxyPdf } = require('../controllers/noteController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(protect, getNotes).post(protect, upload.single('pdf'), createNote);
router.route('/proxy/:id').get(protect, proxyPdf);
router.route('/:id/approve').put(protect, admin, approveNote);
router.route('/:id').delete(protect, admin, deleteNote);

module.exports = router;
