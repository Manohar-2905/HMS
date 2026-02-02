const Note = require('../models/Note');
const User = require('../models/User');
const { Op } = require('sequelize');

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
        // console.log('GET /api/notes hit');
        let notesQuery = {};

        if (!req.user || req.user.role !== 'admin') {
            notesQuery = {
                [Op.or]: [
                    { isApproved: true },
                    { uploadedBy: req.user.id }
                ]
            };
        }

        const notes = await Note.findAll({
            where: notesQuery,
            include: [{ model: User, as: 'uploader', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
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

        const note = await Note.create({
            title,
            section,
            category: finalCategory,
            pdfUrl,
            uploadedBy: req.user.id,
            isApproved: req.user.role === 'admin',
        });

        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed' });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private/Admin
const deleteNote = async (req, res) => {
    const note = await Note.findByPk(req.params.id);

    if (note) {
        if (note.pdfUrl) {
            await deleteFile(note.pdfUrl, 'raw');
        }
        await note.destroy();
        res.json({ message: 'Note removed' });
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
};

// @desc    Approve a note
// @route   PUT /api/notes/:id/approve
// @access  Private/Admin
const approveNote = async (req, res) => {
    const note = await Note.findByPk(req.params.id);

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
        const note = await Note.findByPk(req.params.id);

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

        // Helper to fetch with redirect support
        const fetchUrl = (url, redirectCount = 0) => {
            if (redirectCount > 5) {
                return res.status(500).json({ message: 'Too many redirects' });
            }

            // Ensure HTTPS/HTTP protocol
            let targetUrl = url;
            if (targetUrl.startsWith('http:')) {
                // targetUrl is already http
            } else if (!targetUrl.startsWith('https:')) {
                // Add https if missing
                targetUrl = `https://${targetUrl}`;
            }

            const urlObj = new URL(targetUrl);
            const client = urlObj.protocol === 'https:' ? https : http;

            const request = client.get(targetUrl, (response) => {
                // Handle Redirects
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    return fetchUrl(response.headers.location, redirectCount + 1);
                }

                // Handle Errors
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).json({
                        message: `Failed to fetch from Cloudinary: ${response.statusCode}`
                    });
                }

                // Success - pipe PDF
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${note.title}.pdf"`);
                res.setHeader('Cache-Control', 'public, max-age=3600');
                response.pipe(res);
            });

            request.on('error', (error) => {
                console.error('Proxy request error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Failed to proxy PDF request' });
                }
            });
        };

        // Start fetching
        let startUrl = pdfUrl.replace(/^http:/, 'https:');
        if (!startUrl.startsWith('http://') && !startUrl.startsWith('https://')) {
            startUrl = `https://${startUrl}`;
        }

        fetchUrl(startUrl);

    } catch (error) {
        console.error('Proxy PDF error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error proxying PDF' });
        }
    }
};

module.exports = { getNotes, createNote, deleteNote, approveNote, proxyPdf };
