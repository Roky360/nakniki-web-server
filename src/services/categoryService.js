const Category = require('../models/categoryModel');
const Movie = require('../models/movieModel');

const createCategory = async (name, promoted) => {
    // try to create new category and save it
    name = name.trim();
    const category = new Category({name, promoted});
    return await category.save();
};

const getAllCategories = async () => {
    try {
        // try to return all the categories
        return await Category.find({});
    } catch (error) {
        // if there was an error throw it
        throw new Error('Error get all categories: ' + error.message);
    }
};

const getCategoryById = async (categoryId) => {
    try {
        // try to get the category by the id
        const category = await Category.findById(categoryId);
        if (!category) {
            // if the category is not exist return null
            return null;
        }
        return category;
    } catch (error) {
        // invalid id (cannot be cast to ObjectId)
        return null;
    }
};

const updateCategory = async (categoryId, name, promoted) => {
    // try to get the category
    const category = await getCategoryById(categoryId);

    // if the category is not exist return null
    if (category == null) {
        return null;
    }

    if (name !== undefined) {
        // change the new name is not undefined than change the name
        category.name = name;
    }

    if (promoted !== undefined) {
        // if the promoted is not undefined than change the promoted
        category.promoted = promoted;
    }

    // save the category and return it
    await category.save();
    return category;
};

const deleteCategory = async (categoryId) => {
    // try to get the category
    const category = await getCategoryById(categoryId);

    // if the category is not exist return null
    if (category == null) {
        return null;
    }

    // delete all the categories is the movies
    await Movie.updateMany(
        {categories: categoryId},
        {$pull: {categories: categoryId}}
    );

    // delete the category
    await category.deleteOne();
    return category;
};

module.exports = {createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory};
