const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    let notes;
    if (req.user && req.user.role === 'admin') {
        notes = await Note.find({}).populate('uploadedBy', 'name email');
    } else {
        notes = await Note.find({ isApproved: true }).populate('uploadedBy', 'name email');
    }
    res.json(notes);
};

// @desc    Upload a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, section } = req.body;
    let pdfUrl = '';

    try {
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'notes' },
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
            pdfUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const note = new Note({
            title,
            section,
            pdfUrl,
            uploadedBy: req.user._id,
            isApproved: req.user.role === 'admin',
        });

        const createdNote = await note.save();
        res.status(201).json(createdNote);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed' });
    }
};

const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private/Admin
const deleteNote = async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
        if (note.pdfUrl) {
            await deleteFile(note.pdfUrl, 'notes');
        }
        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
};

// @desc    Approve a note
// @route   PUT /api/notes/:id/approve
// @access  Private/Admin
const approveNote = async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (note) {
        note.isApproved = true;
        const updatedNote = await note.save();
        res.json(updatedNote);
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
};

module.exports = { getNotes, createNote, deleteNote, approveNote };
