const mongoose = require('mongoose');

const roomSchema = mongoose.Schema(
    {
        roomName: { type: String, required: true },
        roomCost: { type: Number, required: true },
        roomDetails: { type: String, required: true },
        beds: { type: Number, required: true, default: 1 },
        capacity: { type: Number, required: true, default: 1 },
        size: { type: String, required: true, default: '100 sq ft' },
        images: [{ type: String }], // Cloudinary URLs
    },
    { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
