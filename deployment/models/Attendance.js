const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Leave'),
        defaultValue: 'Present',
    },
    checkIn: {
        type: DataTypes.STRING, // "HH:mm"
    },
    checkOut: {
        type: DataTypes.STRING, // "HH:mm"
    },
    remarks: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'date'],
        },
    ],
});

module.exports = Attendance;
