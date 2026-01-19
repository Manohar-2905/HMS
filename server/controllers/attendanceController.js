const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private/Admin
const markAttendance = async (req, res) => {
    const { attendanceData } = req.body; // Array of { userId, date, status, remarks }

    if (!attendanceData || !Array.isArray(attendanceData)) {
        return res.status(400).json({ message: 'Invalid attendance data' });
    }

    try {
        const operations = attendanceData.map(item => {
            const date = new Date(item.date);
            date.setHours(0, 0, 0, 0); // Normalize to midnight

            return Attendance.findOneAndUpdate(
                { user: item.userId, date: date },
                {
                    status: item.status,
                    remarks: item.remarks,
                },
                { upsert: true, new: true, runValidators: true }
            );
        });

        await Promise.all(operations);
        res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking attendance' });
    }
};

// @desc    Get attendance history for logged in student
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
    try {
        const history = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance history' });
    }
};

// @desc    Get all attendance records for a specific date
// @route   GET /api/attendance/date/:date
// @access  Private/Admin
const getAttendanceByDate = async (req, res) => {
    try {
        const queryDate = new Date(req.params.date);
        queryDate.setHours(0, 0, 0, 0);

        const records = await Attendance.find({ date: queryDate }).populate('user', 'name email');
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records' });
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getAttendanceByDate
};
