const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getMyAttendance,
    getAttendanceByDate,
    getAttendanceByMonth,
    markBulkAttendance
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/mark', protect, admin, markAttendance);
router.post('/bulk', protect, admin, markBulkAttendance);
router.get('/my', protect, getMyAttendance);
router.get('/date/:date', protect, admin, getAttendanceByDate);
router.get('/history/:userId/:month/:year', protect, getAttendanceByMonth);

module.exports = router;
