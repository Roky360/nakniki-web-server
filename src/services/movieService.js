const Movie = require('../models/movieModel');
const Category = require('../models/categoryModel');
const categoryService = require('../services/categoryService');
const recommendationService = require('../services/recommend/recommendationService');

/**
 *
 * @param {The category's name, string} name
 * @param {The category's release date, DATE - dd/mm/yyyy format} published
 * @param {The performing actors, string} actors
 * @param {Thumbnail, string for now} thumbnail
 * @param {A quick descryption of the movie's plot, string} description
 * @param {The length of the movie in minutes, number} length
 * @param {The categories' IDs that the movie belongs to, ex: horror or action, Category[]} categories
 * @returns
 */
const createMovie = async (name, published, actors, thumbnail, description, length, categories) => {
    try {
        // Validate the category IDs
        const categoryDocs = await Promise.all(
            categories.map(async (id) => await categoryService.getCategoryById(id))
        );

        // Returns an error if at least one category is incorrect, bad users deserve punishment >:D
        const invalidCategories = categoryDocs.filter(category => category === null);
        if (invalidCategories.length > 0) {
            return null;
        }

        const validCategories = categoryDocs.filter(category => category !== null);
        if (validCategories.length === 0) {
            return null;
        }
        // Saves the valid category IDs
        const validCategoryIds = validCategories.map(category => category._id);
        // Create the movie with the valid category IDs
        const movie = new Movie({
            name,
            published,
            actors: actors.split(',').map(actor => actor.trim()),
            thumbnail,
            description,
            length,
            categories: validCategoryIds,
            recom_id: await recommendationService.generateRecomId()
        });
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
            {$match: {categories: catID}},
            {$sample: {size: 20}}
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
        return {message: 'Category added successfully', movie};
    } catch (error) {
        throw new Error('Error adding category to movie: ' + error.message);
    }
};

/**
 * Searches movies that one of their properties includes `query`.
 *
 * @param query What movies has to include to match the search.
 */
const searchMovies = async (query) => {
    // if query is empty
    if (query === null || query === undefined) {
        return [];
    }
    query = query.trim();
    if (query === "") {
        return [];
    }

    // get the IDs of any categories that may match the query
    const matchingCategoryIds = (await Category.find({
        name: {$regex: query, $options: 'i'}
    })).map(category => category._id);
    // try to convert the query to a number to match the length field
    const lengthFromQuery = Number.parseInt(query);

    return Movie.find({
        $or: [
            {name: {$regex: query, $options: 'i'}},
            {published: {$regex: query, $options: 'i'}},
            {actors: {$regex: query, $options: 'i'}},
            {description: {$regex: query, $options: 'i'}},
            {length: isNaN(lengthFromQuery) ? 0 : lengthFromQuery},
            {categories: {$in: matchingCategoryIds}},
        ]
    });
}

module.exports = {createMovie, get20MoviesByCategory, addCategoryToMovie, searchMovies};