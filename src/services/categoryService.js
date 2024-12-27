const Category = require('../models/categoryModel');

const createCategory = async (name, promoted) => {
    try {
        // try to create new category and save it
        const category = new Category({name, promoted});
        return await category.save();
    }
    catch (error) {
        // if there was an error throw it
        throw new Error('Error creating category: ' + error.message);
    }
};

const getAllCategories = async () => {
    try {
        // try to return all the categories
        return await Category.find({});
    }
    catch (error) {
        // if there was an error throw it
        throw new Error('Error get all categories: ' + error.message);
    }
};


module.exports = { createCategory, getAllCategories };