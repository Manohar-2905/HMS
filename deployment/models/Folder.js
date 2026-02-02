const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Folder = sequelize.define('Folder', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parentFolderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Folders',
            key: 'id',
        },
        defaultValue: null,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    timestamps: true,
});

module.exports = Folder;
