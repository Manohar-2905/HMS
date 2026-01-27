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
            // Force UTC Date from YYYY-MM-DD string
            const date = new Date(item.date);
            // Ensure no local time interference (though '2026-01-28' is usually UTC midnight)
            // Storing just the date part timestamp is safest.

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

        // Fetch all students
        const students = await User.find({ role: 'user' }).select('name email phone photo');

        // Fetch existing records for this date
        const records = await Attendance.find({ date: queryDate });

        // Merge records: Default students without a record to "Present"
        const mergedRecords = students.map(student => {
            const existingRecord = records.find(r => r.user.toString() === student._id.toString());
            return {
                user: student,
                date: queryDate,
                status: existingRecord ? existingRecord.status : 'Present',
                remarks: existingRecord ? existingRecord.remarks : '',
                _id: existingRecord ? existingRecord._id : null,
                isVirtual: !existingRecord // Flag for UI if needed
            };
        });

        res.json(mergedRecords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

// @desc    Get attendance history for a specific student (Admin) or current student for a specific month
// @route   GET /api/attendance/history/:userId/:month/:year
// @access  Private
const getAttendanceByMonth = async (req, res) => {
    try {
        const { userId, month, year } = req.params;

        // Month is 1-indexed (1-12)
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        endDate.setHours(23, 59, 59, 999);

        // Security check: If not admin, can only check own attendance
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const history = await Attendance.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching monthly history' });
    }
};

// @desc    Mark attendance for a date range
// @route   POST /api/attendance/bulk
// @access  Private/Admin
const markBulkAttendance = async (req, res) => {
    const { userId, startDate, endDate, status, remarks } = req.body;

    if (!userId || !startDate || !endDate || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Ensure strictly date comparison without time interference
        // (Assuming input is YYYY-MM-DD or equivalent ISO date part)

        if (end < start) {
            return res.status(400).json({ message: 'End date cannot be before start date' });
        }

        const operations = [];
        let curr = new Date(start);

        while (curr <= end) {
            // Create a fresh Date object for the current iteration
            const dateToMark = new Date(curr);

            operations.push(
                Attendance.findOneAndUpdate(
                    { user: userId, date: dateToMark },
                    { status, remarks },
                    { upsert: true, new: true, runValidators: true }
                )
            );

            // Advance by 1 day
            curr.setDate(curr.getDate() + 1);
        }

        await Promise.all(operations);
        res.status(200).json({ success: true, message: `Attendance marked for ${operations.length} days` });
    } catch (error) {
        console.error('Bulk attendance error:', error);
        res.status(500).json({ message: 'Error marking bulk attendance' });
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getAttendanceByDate,
    getAttendanceByMonth,
    markBulkAttendance
};
