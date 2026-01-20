const express = require('express');
const router = express.Router();
const { getEvents, addEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getEvents)
    .post(protect, admin, upload.single('image'), addEvent);

router.route('/:id')
    .delete(protect, admin, deleteEvent);

module.exports = router;
