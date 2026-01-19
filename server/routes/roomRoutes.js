const express = require('express');
const router = express.Router();
const { getRooms, createRoom, deleteRoom, updateRoom } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getRooms).post(protect, admin, upload.single('image'), createRoom);
router.route('/:id')
    .delete(protect, admin, deleteRoom)
    .put(protect, admin, upload.single('image'), updateRoom);

module.exports = router;
