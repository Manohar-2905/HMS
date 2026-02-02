const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
    roomName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    roomCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    roomDetails: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    beds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '100 sq ft',
    },
    images: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: [],
    },
}, {
    timestamps: true,
});

module.exports = Room;
