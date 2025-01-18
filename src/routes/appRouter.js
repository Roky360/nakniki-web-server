const express = require('express');
const router = express.Router();

const Users = require('./userRoute');
const tokens = require('./tokenRoute');
const category = require('./categoryRoute');
const movie = require("./movieRoute");
const uploads = require('./uploadsRouter');

router.use('/users', Users);
router.use('/tokens', tokens);
router.use('/categories', category);
router.use('/movies', movie);
router.use('/uploads', uploads);

module.exports = router;