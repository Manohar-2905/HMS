const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    roomName: { type: String, required: true }, // e.g. "101"
    roomCost: { type: Number, required: true },
    roomDetails: { type: String },
    images: [{ type: String }] // Cloudinary URLs
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
