const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getMyAttendance,
    getAttendanceByDate
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/mark', protect, admin, markAttendance);
router.get('/my', protect, getMyAttendance);
router.get('/date/:date', protect, admin, getAttendanceByDate);

module.exports = router;
