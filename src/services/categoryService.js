const Category = require('../models/categoryModel');
const Movie = require('../models/movieModel');
const {parseSchemaErrors} = require("../utils/errorUtils");

const createCategory = async (name, promoted) => {
    // create new category and save it
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
    // get the category by the id
    const category = await getCategoryById(categoryId);

    // if the category is not exist return false success
    if (category === null) {
        return {
            success: false,
            found: false,
            msg: "Category not found."
        };
    }

    // prepare the updated category data
    const updatedCategoryData = {
        name: name !== undefined ? name : category.name,
        promoted: promoted !== undefined ? promoted : category.promoted,
    };

    // validate the updated data
    try {
        // Create a temporary category object for validation
        await (await new Category(updatedCategoryData)).validate();
    } catch (error) {
        return {
            success: false,
            found: true,
            msg: parseSchemaErrors(error)
        };
    }

    try {
        // apply the changes
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            updatedCategoryData,
            { new: true}
        );

        // return true and the new category
        return {
            success: true,
            category: updatedCategory
        };
    }
    catch (error) {
        return {
            success: false,
            found: true,
            msg: parseSchemaErrors(error)
        };
    }
};

const deleteCategory = async (categoryId) => {
    // get the category by the id
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
