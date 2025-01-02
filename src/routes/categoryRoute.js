const express = require('express');
const router = express.Router();

const {authUser} = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');

router.route('/')
    .post(authUser, categoryController.createCategory)
    .get(categoryController.getAllCategories);

router.route('/:id')
    .get(authUser, categoryController.getCategoryById)
    .patch(authUser, categoryController.updateCategory)
    .delete(authUser, categoryController.deleteCategory);

module.exports = router;