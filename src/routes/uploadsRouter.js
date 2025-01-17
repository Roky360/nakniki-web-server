const express = require('express');
const router = express.Router();

const {authUser, authAdmin} = require('../controllers/authController');
const uploadsController = require('../controllers/uploadsController');
const {upload} = require("../services/uploadsService");

// require admin privileges for all these endpoints

router.route('/')
    .post(authUser, authAdmin, upload.single('video'), uploadsController.uploadVideo);

router.route('/:id')
    .get(authUser, authAdmin, uploadsController.getVideo)
    .put(authUser, authAdmin, upload.single('video'), uploadsController.putVideo)
    .delete(authUser, authAdmin, uploadsController.deleteVideo);

module.exports = router;
