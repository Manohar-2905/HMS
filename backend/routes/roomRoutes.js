const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getRooms).post(protect, admin, upload.array('image'), createRoom);
router.route('/:id').put(protect, admin, updateRoom).delete(protect, admin, deleteRoom);

module.exports = router;
