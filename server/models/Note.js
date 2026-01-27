const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        section: { type: String, required: true },
        category: { type: String, enum: ['Admin', 'User'], required: true },
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
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
