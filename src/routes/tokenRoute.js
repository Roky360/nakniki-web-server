const express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');

router.route('/').post(userController.isUserExist);

module.exports = router;