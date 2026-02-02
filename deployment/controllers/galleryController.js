const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res) => {
    const galleryItems = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.json(galleryItems);
};

// @desc    Add a gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const addGalleryItem = async (req, res) => {
    const { title, category } = req.body;
    let imageUrl = '';

    try {
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: 'gallery' },
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

        const galleryItem = await Gallery.create({
            title,
            category: category || 'General',
            image: imageUrl,
        });

        res.status(201).json(galleryItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gallery item creation failed' });
    }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
    const galleryItem = await Gallery.findByPk(req.params.id);

    if (galleryItem) {
        if (galleryItem.image) {
            await deleteFile(galleryItem.image, 'image');
        }
        await galleryItem.destroy();
        res.json({ message: 'Gallery item removed' });
    } else {
        res.status(404).json({ message: 'Gallery item not found' });
    }
};

module.exports = {
    getGallery,
    addGalleryItem,
    deleteGalleryItem,
};
