const express = require('express');
var router = express.Router();

const categoryController = require('../controllers/categoryController');

router.route('/')
    .post(categoryController.createCategory)
    .get(categoryController.getAllCategories);

router.route('/:id')
    .get(categoryController.getCategoryById)
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;