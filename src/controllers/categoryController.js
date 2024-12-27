const categoryService = require('../services/categoryService');

const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(
            req.body.name,
            req.body.promoted
        );
        // return status 201 created
        res.status(201).json(category);
    } catch (error) {
        // if there was error return error message
        res.status(400).json({ errors: [error.message] });
    }
};

const getAllCategories = async (req, res) => {
    try {
        // try to get the categories using category services
        const categories = await categoryService.getAllCategories();
        // return the categories with status 200
        res.status(200).json(categories);
    }
    catch (error) {
        // if there was error return the error
        res.status(400).json({ errors: [error.message] });
    }
}


module.exports = { createCategory, getAllCategories };