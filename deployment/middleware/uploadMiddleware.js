const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.memoryStorage(); // Store in memory to upload to Cloudinary directly

const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = /pdf|jpg|jpeg|png|webp|mp4|webm|mov|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, or Videos Only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
