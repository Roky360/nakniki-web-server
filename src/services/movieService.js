const Movie = require('../models/movieModel');
const Category = require('../models/categoryModel');
const CategoryService = require('../services/categoryService');

/**
 * 
 * @param {The category's name, string} name 
 * @param {The category's release date, DATE - dd/mm/yyyy format} published 
 * @param {The performing actors, string} actors 
 * @param {Thumbnail, string for now} thumbnail 
 * @param {A quick descryption of the movie's plot, string} descryption 
 * @param {The length of the movie in minutes, number} length 
 * @param {The categories the movie belongs to, ex: horror or action, Category} categories 
 * @returns 
 */
const createMovie = async (name, published, actors, thumbnail, description, length, categories) => {
    try {
        // Use the function from categoryService to find category IDs
        const categoryDocs = await CategoryService.getCategoryByName(categories);
        // If no valid categories were found, ERROR
        if (categoryDocs.length === 0) {
            return null;
        }

        // Extract category IDs from the found documents
        const categoryIds = categoryDocs.map(cat => cat._id);

        // Create the movie with the resolved category IDs
        const movie = new Movie({
            name,
            published,
            actors: actors.split(',').map(actor => actor.trim()),
            thumbnail,
            description,
            length,
            categories: categoryIds,
        });

        // Save and return the movie
        return await movie.save();
    } catch (error) {
        throw new Error('Error creating movie: ' + error.message);
    }
};

/**
 * @param {the category's ID} catID 
 * @returns up to 20 random movies from that category
 */

const get20MoviesByCategory = async (catID) => {
    try {
        // If the category does not exist, or is not promoted, do not show it
        const category = await Category.findById(catID);
        if (!category || !category.promoted) {
            return [];
        }

        // Get 20 random movies of that category
        const movies = await Movie.aggregate([
            { $match: { categories: catID } },
            { $sample: { size: 20 } }
        ]);

        return movies;
        // In case the code died somehow
    } catch (error) {
        throw new Error('Error getting movies: ' + error.message);
    }
};

/**
 * @param {The movie's ID} movieID 
 * @param {The category's ID} catID 
 * @returns a message if the operation succeeded, error if it failed, null if it had a logic error
 */
const addCategoryToMovie = async (movieID, catID) => {
    try {
        // Find the movie by ID
        const movie = await Movie.findById(movieID);
        if (!movie) {
            return null;
        }

        // Check if the category already exists in the movie's categories
        if (movie.categories.includes(catID)) {
            return null;
        }

        // Add the category to the movie's categories array
        movie.categories.push(catID);

        // Save the updated movie
        await movie.save();
        return { message: 'Category added successfully', movie };
    } catch (error) {
        throw new Error('Error adding category to movie: ' + error.message);
    }
};

module.exports = {createMovie, get20MoviesByCategory, addCategoryToMovie};