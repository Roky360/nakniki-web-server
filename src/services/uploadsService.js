const multer = require('multer');
const path = require('path');
const fs = require('fs');

// define upload dirs and create if it doesn't exist
const UPLOADS_DIR = path.join(path.dirname(require.main.filename) + '/uploads/movies');
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


// const videoStorage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, path.join(UPLOADS_DIR, '/videos')); // where movies will be stored
//     },
//     filename: (req, file, callback) => {
//         callback(null, `${req.headers['movie_id']}.${file.originalname.split('.')[1]}`);
//     }
// });
//
// const uploadVideo = multer({
//     storage: videoStorage,
//     fileFilter: (req, file, callback) => {
//         // check that the correct file type is passed
//         const fileTypes = /mp4|gif|m4v|avi|mov/;
//         const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
//         const mimeType = fileTypes.test(file.mimetype);
//
//         if (extName && mimeType) {
//             callback(null, true);
//         } else {
//             callback('Only video files are allowed', false);
//         }
//     }
// });
//
// const thumbStorage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback(null, path.join(UPLOADS_DIR, '/thumbnails')); // where thumbnails will be stored
//     },
//     filename: (req, file, callback) => {
//         callback(null, `${req.headers['movie_id']}.${file.originalname.split('.')[1]}`);
//     }
// });
//
// const uploadThumb = multer({
//     storage: videoStorage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith("image/")) {
//             cb(null, true);
//         } else {
//             cb('Only image files are allowed', false);
//         }
//     },
// });

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

module.exports = {upload, UPLOADS_DIR};
