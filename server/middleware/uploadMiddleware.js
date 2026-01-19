const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.memoryStorage(); // Store in memory to upload to Cloudinary directly

const checkFileType = (file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images or PDFs Only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
