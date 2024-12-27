const express = require('express');
const router = express.Router();

const Users = require('userRoute');
const tokens = require('tokenRoute');

router.use('/users', Users);
router.use('/tokens', tokens);
