const Note = require('../models/Note');
const Folder = require('../models/Folder');
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
        const folderId = req.query.folderId || null;

        // Fetch folders in this directory
        const folders = await Folder.find({ parentFolder: folderId }).populate('createdBy', 'name');

        // Fetch notes in this directory
        let notesQuery = { folder: folderId };
        
        // If not admin, maybe still show only approved? 
        // For Drive-like behavior, usually you see what you upload or shared. 
        // Keeping original logic: Admins see all, Users see approved.
        if (!req.user || req.user.role !== 'admin') {
            notesQuery.isApproved = true;
        }

        const notes = await Note.find(notesQuery).populate('uploadedBy', 'name email');

        // Get current folder details for breadcrumbs if inside a folder
        let currentFolder = null;
        if (folderId) {
            currentFolder = await Folder.findById(folderId);
        }

        res.json({ folders, notes, currentFolder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
};

// @desc    Create a new folder
// @route   POST /api/notes/folder
// @access  Private/Admin (or any user depending on requirement, assuming Admin for now regarding management)
const createFolder = async (req, res) => {
    try {
        const { name, parentFolder } = req.body;
        const folder = new Folder({
            name,
            parentFolder: parentFolder || null,
            createdBy: req.user._id
        });
        const createdFolder = await folder.save();
        res.status(201).json(createdFolder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating folder' });
    }
};

// @desc    Upload a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, section, folderId } = req.body;
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
                            // Ensure public access - remove type and format which can cause issues
                            // Public access is default for unsigned uploads
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
            // Use secure_url which is always HTTPS and public
            pdfUrl = result.secure_url;
        } else {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const note = new Note({
            title,
            section,
            pdfUrl,
            folder: folderId || null,
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

// @desc    Delete a folder and its contents
// @route   DELETE /api/notes/folder/:id
// @access  Private/Admin
const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Recursive delete or just delete notes and subfolders?
        // Simple 1-level for now or assume flat for this step - but Drive is recursive.
        // We will just delete the folder, and any notes directly inside it. 
        // Ideally we should delete everything recursively.
        
        // Find all notes in this folder
        const notes = await Note.find({ folder: folder._id });
        for (const note of notes) {
            if (note.pdfUrl) {
                await deleteFile(note.pdfUrl, 'notes');
            }
            await note.deleteOne();
        }

        // Find subfolders - we might need a recursive helper properly, 
        // but for now, simple deletion.
        // For robustness, let's just delete the folder itself and orphans.
        // Or prevent delete if not empty.
        // Let's implement delete contents:
        await Folder.deleteMany({ parentFolder: folder._id }); // Delete immediate subfolders (orphaning their children technically if > 1 level)

        await folder.deleteOne();
        res.json({ message: 'Folder removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delete failed' });
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

module.exports = { getNotes, createNote, deleteNote, approveNote, createFolder, deleteFolder, proxyPdf };
