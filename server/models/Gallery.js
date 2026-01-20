const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        image: { type: String, required: true },
        category: { type: String, default: 'General' },
    },
    { timestamps: true }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
