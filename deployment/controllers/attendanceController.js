const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Op } = require('sequelize');

// @desc    Mark attendance for students
// @route   POST /api/attendance/mark
// @access  Private/Admin
const markAttendance = async (req, res) => {
    const { attendanceData } = req.body; // Array of { userId, date, status, remarks }

    if (!attendanceData || !Array.isArray(attendanceData)) {
        return res.status(400).json({ message: 'Invalid attendance data' });
    }

    try {
        const operations = attendanceData
            .filter(item => item.userId) // Filter out items with missing userId
            .map(item => {
                return Attendance.upsert({
                    userId: item.userId,
                    date: item.date,
                    status: item.status,
                    remarks: item.remarks,
                });
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
        const history = await Attendance.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
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
        const queryDate = req.params.date;

        // Fetch all students
        const students = await User.findAll({
            where: { role: 'user' },
            attributes: ['id', 'name', 'email', 'phone', 'photo']
        });

        // Fetch existing records for this date
        const records = await Attendance.findAll({ where: { date: queryDate } });

        // Merge records: Default students without a record to "Present"
        const mergedRecords = students.map(student => {
            const existingRecord = records.find(r => r.userId === student.id);
            return {
                user: student,
                date: queryDate,
                status: existingRecord ? existingRecord.status : 'Present',
                remarks: existingRecord ? existingRecord.remarks : '',
                id: existingRecord ? existingRecord.id : null,
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
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;

        // Security check: If not admin, can only check own attendance
        if (req.user.role !== 'admin' && req.user.id.toString() !== userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const history = await Attendance.findAll({
            where: {
                userId: userId,
                date: { [Op.between]: [startDate, endDate] }
            },
            order: [['date', 'ASC']]
        });

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
        const start = new Date(`${startDate}T00:00:00Z`);
        const end = new Date(`${endDate}T00:00:00Z`);

        if (end < start) {
            return res.status(400).json({ message: 'End date cannot be before start date' });
        }

        const operations = [];
        let curr = new Date(start);

        while (curr <= end) {
            const dateToMark = curr.toISOString().split('T')[0];

            operations.push(
                Attendance.upsert({
                    userId,
                    date: dateToMark,
                    status,
                    remarks
                })
            );

            // Advance by 1 day using UTC to avoid DST/timezone issues
            curr.setUTCDate(curr.getUTCDate() + 1);
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
