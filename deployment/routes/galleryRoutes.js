const express = require('express');
const router = express.Router();
const { getGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getGallery)
    .post(protect, admin, upload.single('image'), addGalleryItem);

router.route('/:id')
    .delete(protect, admin, deleteGalleryItem);

module.exports = router;
