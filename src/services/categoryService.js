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

/**
 * Finds multiple categories by using their names, returns an array of categories ID
 * @param {string, the names of the categories} names 
 * @returns IDs of the categories (if they exist)
 */
const getCategoryByName = async (names) => {
    try {
        const categoryNames = [].concat(names || []);
        const categories = await Category.find({ name: { $in: categoryNames } });
        return categories;
    } catch (error) {
        throw new Error('Error fetching categories: ' + error.message);
    }
}

module.exports = { createCategory, getAllCategories, getCategoryByName };