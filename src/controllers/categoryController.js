const categoryService = require('../services/categoryService');
const {parseSchemaErrors} = require("../utils/errorUtils");

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(
            req.body.name,
            req.body.promoted
        );
        // return status 201 created
        return res.status(201).location(`api/categories/${category._id}`).json();
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({errors: parseSchemaErrors(error)});
    }
};

const getAllCategories = async (req, res) => {
    try {
        // try to get the categories using category services
        const categories = await categoryService.getAllCategories();
        // return the categories with status 200
        return res.status(200).json(categories);
    } catch (error) {
        // if there was error return the error
        return res.status(400).json({errors: [error.message]});
    }
};

const getCategoryById = async (req, res) => {
    try {
        // get the category by his ID from the service
        const category = await categoryService.getCategoryById(req.params.id);
        if (category === null) {
            // if the category not exist return not found
            return res.status(404).json({errors: ['Category not found']});
        }
        // if the category exists return the category
        return res.status(200).json(category);
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({errors: ['An error occurred: ' + error.message]});
    }
};

const updateCategory = async (req, res) => {
    // update the category
    const result = await categoryService.updateCategory(
        req.params.id,
        req.body.name,
        req.body.promoted
    );

    // if success is false
    if (!result.success) {
        if (!result.found) {
            // if the category not found return status 404
            return res.status(404).json({errors: result.msg});
        }
        // return status 400
        return res.status(400).json({errors: result.msg});
    }

    // if the category exists return 204 NO CONTENT
    return res.status(204).json();
};

const deleteCategory = async (req, res) => {
    // delete the category by the id
    const category = await categoryService.deleteCategory(req.params.id);

    if (category === null) {
        // if the category null so the category is not exist
        return res.status(404).json({error: 'Category does not exist'});
    }

    // return 204 NO CONTENT
    return res.status(204).json();
};


module.exports = {createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory};