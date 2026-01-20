const mongoose = require('mongoose');

const folderSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        parentFolder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Folder = mongoose.model('Folder', folderSchema);
module.exports = Folder;
