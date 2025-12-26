const Room = require('../models/Room');

// @desc    Get all rooms (Public)
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a room (Admin)
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
    const { roomName, roomCost, roomDetails } = req.body;
    let images = [];

    if (req.files) {
        images = req.files.map(file => file.path);
    }

    try {
        const room = await Room.create({
            roomName,
            roomCost,
            roomDetails,
            images
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a room (Admin)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            room.roomName = req.body.roomName || room.roomName;
            room.roomCost = req.body.roomCost || room.roomCost;
            room.roomDetails = req.body.roomDetails || room.roomDetails;
            room.images = req.body.images || room.images;

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a room (Admin)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };
