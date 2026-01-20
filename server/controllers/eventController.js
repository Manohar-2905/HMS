const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get all events
// @route   GET /api/events
// @access  Private (Logged-in users)
const getEvents = async (req, res) => {
    const events = await Event.find({}).sort({ date: -1 });
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

        const event = new Event({
            title,
            description,
            date: date || Date.now(),
            image: imageUrl,
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Event creation failed' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        await Event.findByIdAndDelete(req.params.id);
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
