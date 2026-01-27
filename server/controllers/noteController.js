const Note = require('../models/Note');

const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { deleteFile } = require('../utils/cloudinaryHelper');
const https = require('https');
const http = require('http');

// @desc    Get contents (notes and folders) for a directory
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        let notesQuery = {};

        if (!req.user || req.user.role !== 'admin') {
            notesQuery = {
                $or: [
                    { isApproved: true },
                    { uploadedBy: req.user._id }
                ]
            };
        }

        const notes = await Note.find(notesQuery).populate('uploadedBy', 'name email').sort({ createdAt: -1 });

        res.json({ notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};



// @desc    Upload a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, section, category } = req.body;
    let pdfUrl = '';

    try {
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'raw',
                            folder: 'notes',
                            use_filename: true,
                            unique_filename: true,
                        },
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

        // Determine category: if not provided, use uploader's role
        let finalCategory = category;
        if (!finalCategory) {
            finalCategory = req.user.role === 'admin' ? 'Admin' : 'User';
        }

        const note = new Note({
            title,
            section,
            category: finalCategory,
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

// @desc    Proxy PDF file from Cloudinary (bypasses CORS/401 issues)
// @route   GET /api/notes/proxy/:id
// @access  Private
const proxyPdf = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user has access (admin or approved note)
        if (!req.user || (req.user.role !== 'admin' && !note.isApproved)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pdfUrl = note.pdfUrl;
        if (!pdfUrl) {
            return res.status(404).json({ message: 'PDF URL not found' });
        }

        // Ensure HTTPS URL
        let url = pdfUrl.replace(/^http:/, 'https:');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }

        // Parse URL
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        // Fetch PDF from Cloudinary and stream to client
        const request = client.get(url, (response) => {
            // Set appropriate headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${note.title}.pdf"`);
            res.setHeader('Cache-Control', 'public, max-age=3600');

            // Handle errors
            if (response.statusCode !== 200) {
                return res.status(response.statusCode).json({
                    message: `Failed to fetch PDF: ${response.statusCode}`
                });
            }

            // Pipe the response
            response.pipe(res);
        });

        request.on('error', (error) => {
            console.error('Proxy error:', error);
            res.status(500).json({ message: 'Failed to proxy PDF' });
        });

        request.end();
    } catch (error) {
        console.error('Proxy PDF error:', error);
        res.status(500).json({ message: 'Error proxying PDF' });
    }
};

module.exports = { getNotes, createNote, deleteNote, approveNote, proxyPdf };
