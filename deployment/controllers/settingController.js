const Setting = require('../models/Setting');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const { deleteFile } = require('../utils/cloudinaryHelper');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a setting
// @route   POST /api/settings
// @access  Private/Admin
const updateSetting = async (req, res) => {
    try {
        const { key } = req.body;
        let { value } = req.body;

        // Handle file upload if present
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'video',
                            folder: 'site_assets',
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
            value = result.secure_url;
        }

        if (!value) {
            return res.status(400).json({ message: 'Value or file is required' });
        }

        let setting = await Setting.findOne({ where: { key } });

        if (setting) {
            // If updating with a new file, delete the old one
            if (req.file && setting.value) {
                await deleteFile(setting.value, 'video');
            }
            setting.value = value;
            await setting.save();
        } else {
            setting = await Setting.create({ key, value });
        }

        res.json({ message: 'Setting updated', setting });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSetting
};
