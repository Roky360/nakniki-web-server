const multer = require('multer');
const path = require('path');
const fs = require('fs');

// define uploads dir and create if it doesn't exist
const UPLOADS_DIR = path.join(path.dirname(require.main.filename) + '/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOADS_DIR); // where movies will be stored
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname.toString());
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        // check that the correct file type is passed
        const fileTypes = /mp4|gif|m4v|avi|mov/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            callback(null, true);
        } else {
            callback('Only video files are allowed', false);
        }
    }
});

module.exports = {upload, UPLOADS_DIR};
