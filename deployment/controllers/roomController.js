const Room = require('../models/Room');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    const rooms = await Room.findAll({});
    res.json(rooms);
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
    const { roomName, roomCost, roomDetails, beds, capacity, size } = req.body;
    let images = [];

    try {
        if (req.files && req.files.length > 0) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'rooms' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    Readable.from(fileBuffer).pipe(stream);
                });
            };

            for (const file of req.files) {
                const result = await streamUpload(file.buffer);
                images.push(result.secure_url);
            }
        }
        // If images sent as string/array (fallback or additional)
        if (req.body.images) {
            if (Array.isArray(req.body.images)) {
                images = [...images, ...req.body.images];
            } else {
                try {
                    const parsed = JSON.parse(req.body.images);
                    if (Array.isArray(parsed)) images = [...images, ...parsed];
                    else images.push(req.body.images);
                } catch (e) {
                    images.push(req.body.images);
                }
            }
        }

        const room = await Room.create({
            roomName,
            roomCost,
            roomDetails,
            beds,
            capacity,
            size,
            images,
        });

        res.status(201).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Room creation failed' });
    }
};

const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
    const room = await Room.findByPk(req.params.id);

    if (room) {
        if (room.images && room.images.length > 0) {
            for (const imageUrl of room.images) {
                await deleteFile(imageUrl, 'image');
            }
        }
        await room.destroy();
        res.json({ message: 'Room removed' });
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
    const { roomName, roomCost, roomDetails, beds, capacity, size } = req.body;
    const room = await Room.findByPk(req.params.id);

    if (room) {
        room.roomName = roomName || room.roomName;
        room.roomCost = roomCost || room.roomCost;
        room.roomDetails = roomDetails || room.roomDetails;
        room.beds = beds || room.beds;
        room.capacity = capacity || room.capacity;
        room.size = size || room.size;

        if (req.files && req.files.length > 0) {
            // Delete old images
            if (room.images && room.images.length > 0) {
                for (const imageUrl of room.images) {
                    await deleteFile(imageUrl, 'image');
                }
            }
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'rooms' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    Readable.from(fileBuffer).pipe(stream);
                });
            };

            const newImages = [];
            for (const file of req.files) {
                const result = await streamUpload(file.buffer);
                newImages.push(result.secure_url);
            }

            room.images = newImages;
        }

        const updatedRoom = await room.save();
        res.json(updatedRoom);
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
};

module.exports = { getRooms, createRoom, deleteRoom, updateRoom };
