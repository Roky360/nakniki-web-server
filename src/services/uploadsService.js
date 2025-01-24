const multer = require('multer');
const path = require('path');
const fs = require('fs');

// define upload dirs and create if it doesn't exist
const UPLOADS_DIR = path.join(path.dirname(require.main.filename) + '/uploads');
// const UPLOADS_DIR = '/uploads';
const THUMB_DIR = path.join(UPLOADS_DIR, '/thumbnails');
const MOVIES_DIR = path.join(UPLOADS_DIR, '/movies');
// create directories if not exist
const dirs = [THUMB_DIR, MOVIES_DIR];
for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

// storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, THUMB_DIR);
        } else if (file.mimetype.startsWith("video/")) {
            cb(null, MOVIES_DIR);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    },
    filename: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) {
            let fileParts = file.originalname.split(".");
            fileParts[0] = req.headers['movie_id'];
            cb(null, fileParts.join('.'));
        } else {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    },
});

// file filter to allow only images and videos
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

const upload = multer({storage, fileFilter});

module.exports = {upload, UPLOADS_DIR, MOVIES_DIR, THUMB_DIR};
