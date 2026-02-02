const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Get all events
// @route   GET /api/events
// @access  Private (Logged-in users)
const getEvents = async (req, res) => {
    const events = await Event.findAll({ order: [['date', 'DESC']] });
    res.json(events);
};

// @desc    Add an event
// @route   POST /api/events
// @access  Private/Admin
const addEvent = async (req, res) => {
    const { title, description, date } = req.body;
    let imageUrl = '';

    try {
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'events' },
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

            const result = await streamUpload(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const event = await Event.create({
            title,
            description,
            date: date || new Date(),
            image: imageUrl,
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Event creation failed' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    const event = await Event.findByPk(req.params.id);

    if (event) {
        if (event.image) {
            await deleteFile(event.image, 'image');
        }
        await event.destroy();
        res.json({ message: 'Event removed' });
    } else {
        res.status(404).json({ message: 'Event not found' });
    }
};

module.exports = {
    getEvents,
    addEvent,
    deleteEvent,
};
