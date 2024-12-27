const express = require('express');
var router = express.Router();

const categoryController = require('../controllers/categoryController');

router.route('/')
    .post(categoryController.createCategory)
    .get(categoryController.getAllCategories);


module.exports = router;