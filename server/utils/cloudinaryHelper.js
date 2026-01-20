const cloudinary = require('../config/cloudinary');

const deleteFile = async (fileUrl, folder) => {
    if (!fileUrl) return;

    try {
        // Extract public ID from URL
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        // We need: folder/filename

        const parts = fileUrl.split('/');
        const versionIndex = parts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));

        // If version is found, everything after it is the public_id path + extension
        // If not found (sometimes excluded), usually it's after 'upload'

        let publicIdWithExtension = '';
        if (versionIndex !== -1) {
            publicIdWithExtension = parts.slice(versionIndex + 1).join('/');
        } else {
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
            }
        }

        if (!publicIdWithExtension) return;

        // Strip extension (Cloudinary public IDs usually don't include extension for images, but for raw files they might depending on upload type)
        // For 'auto' uploads which become images/pdfs, we usually strip it.
        // However, for raw files, if we uploaded with extension, we might need it. 
        // But our upload middleware/controller uses 'resource_type: auto'.

        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

        // Determine resource type. If it's a PDF, it might be 'image' (converted) or 'raw' or 'video' (rare). 
        // But since we use 'auto', Cloudinary determines.
        // Usually for destroy, we default to 'image' but for PDFs it might need to check.
        // If we want to be safe, we can try deleting as 'image' and 'raw' or 'video'.
        // But most likely it's 'image' for PDFs viewed in browser or 'raw'.

        // For PDFs uploaded as 'raw', we need to specify resource_type
        // Try raw first (for new uploads), then fallback to image (for old uploads)
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        } catch (rawError) {
            // Fallback to image type for backwards compatibility with old uploads
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            } catch (imageError) {
                console.error('Failed to delete file from Cloudinary:', imageError);
            }
        }

    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
    }
};

module.exports = { deleteFile };
