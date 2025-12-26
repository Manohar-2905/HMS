const express = require('express');
const router = express.Router();
const { uploadNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getNotes)
    .post(protect, upload.single('pdfFile'), uploadNote); // 'pdfFile' is the form field name

router.route('/:id').delete(protect, admin, deleteNote);

module.exports = router;
