const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        section: { type: String, required: true },
        pdfUrl: { type: String, required: true },
        isApproved: {
            type: Boolean,
            default: false,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        folder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
