const Note = require('../models/Note');

// @desc    Upload a note (User)
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
    const { title, section } = req.body;
    // req.file is available due to multer
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const note = await Note.create({
            title,
            section,
            pdfUrl: req.file.path, // Cloudinary URL
            uploadedBy: req.user._id
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notes (User sees own, Admin sees all)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        let notes;
        if (req.user.role === 'admin') {
            notes = await Note.find({}).populate('uploadedBy', 'name email');
        } else {
            notes = await Note.find({ uploadedBy: req.user._id });
        }
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note (Admin)
// @route   DELETE /api/notes/:id
// @access  Private/Admin
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Only admin can delete (req: "User cannot delete notes")
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadNote, getNotes, deleteNote };
