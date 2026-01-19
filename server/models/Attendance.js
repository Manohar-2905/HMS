const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Leave'],
            default: 'Present',
        },
        checkIn: {
            type: String, // Store as "HH:mm"
        },
        checkOut: {
            type: String, // Store as "HH:mm"
        },
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a user can only have one attendance record per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
