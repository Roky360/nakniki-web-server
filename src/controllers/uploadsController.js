const {upload, UPLOADS_DIR} = require('../services/uploadsService');
const path = require('path');
const fs = require('fs');

const uploadVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: 'No video file provided.'});
    }

    // success, return the video file name which is the movie id
    const videoId = req.file.fileName;
    res.status(200).json({videoId: videoId});
}

const getVideo = async (req, res) => {
    const videoId = req.params.id;
    const videoPath = path.join(UPLOADS_DIR, videoId);

    // Check if the file exists
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({error: 'Video not found'});
        }
        // send the video file
        res.sendFile(videoPath);
    });
}

const putVideo = async (req, res) => {
    const videoId = req.params.id;
    const videoPath = path.join(UPLOADS_DIR, videoId);

    if (!req.file) {
        return res.status(400).json({error: 'No video file provided.'});
    }

    // Check if the original file exists
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({error: 'Original video not found.'});
        }

        // Replace the file with the new one
        fs.unlink(videoPath, (err) => {
            if (err) {
                return res.status(500).json({error: 'Error replacing the video.'});
            }

            // Rename the uploaded file to the original file's name
            fs.rename(req.file.path, videoPath, (err) => {
                if (err) {
                    return res.status(500).json({error: 'Error saving the new video file.'});
                }
                // replace was successful
                res.status(204).json({});
            });
        });
    });
}

const deleteVideo = async (req, res) => {
    const videoId = req.params.id;
    const videoPath = path.join(UPLOADS_DIR, videoId);

    // check if the file exists
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({error: 'Video not found.'});
        }

        // delete the file
        fs.unlink(videoPath, (err) => {
            if (err) {
                return res.status(500).json({error: 'Error deleting the video.'});
            }
             // deleted successfully, return the deleted video (movie) id
            res.status(200).json({videoId: videoId});
        });
    });
}

module.exports = {uploadVideo, getVideo, putVideo, deleteVideo};
