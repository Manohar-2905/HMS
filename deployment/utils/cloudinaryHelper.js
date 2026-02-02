const cloudinary = require('../config/cloudinary');

const deleteFile = async (fileUrl, resourceType = null) => {
    if (!fileUrl) return;

    try {
        // Extract public ID from URL
        // URL format: https://res.cloudinary.com/<cloud_name>/<resource_type>/<type>/v<version>/<public_id>.<format>

        const parts = fileUrl.split('/');
        const versionIndex = parts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));

        let publicIdWithExtension = '';
        if (versionIndex !== -1) {
            publicIdWithExtension = parts.slice(versionIndex + 1).join('/');
        } else {
            // Fallback: finding 'upload' keyword
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
            }
        }

        if (!publicIdWithExtension) return;

        // Remove extension for publicId (except for raw files where sometimes it matters, but usually Cloudinary handles it)
        // Ideally we strip extension.
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

        const options = {};
        if (resourceType) {
            options.resource_type = resourceType;
        } else {
            // Auto-detect based on extension if not provided
            const ext = publicIdWithExtension.split('.').pop().toLowerCase();
            if (['mp4', 'webm', 'mov'].includes(ext)) {
                options.resource_type = 'video';
            } else if (['pdf', 'doc', 'docx', 'xls', 'zip'].includes(ext)) {
                options.resource_type = 'raw';
            } else {
                options.resource_type = 'image';
            }
        }

        console.log(`Cloudinary attempting delete: ${publicId} as ${options.resource_type}`);
        const result = await cloudinary.uploader.destroy(publicId, options);
        console.log(`Cloudinary delete result [${options.resource_type}]:`, result);

        // If 'raw' failed (not found) and we auto-detected or passed raw, try 'image' just in case (for auto-converted PDFs old uploads)
        if (result.result === 'not found' && options.resource_type === 'raw') {
            console.log('Retrying delete as image...');
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        }

    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
    }
};

module.exports = { deleteFile };
