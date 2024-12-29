const Movie = require('../models/movieModel');
const Category = require('../models/categoryModel');
const categoryService = require('../services/categoryService');
const recommendationService = require('../services/recommend/recommendationService');
const User = require('../models/userModel');

/**
 * 
 * @param {The category's name, string} name 
 * @param {The category's release date, DATE - dd/mm/yyyy format} published 
 * @param {The performing actors, string} actors 
 * @param {Thumbnail, string for now} thumbnail 
 * @param {A quick descryption of the movie's plot, string} descryption 
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
            recom_id : await recommendationService.generateRecomId()
        });
        return await movie.save();
    } 
    catch (error) {
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
 * @param {The movie's ID, string} id 
 * @returns movie, null, or error, depending on the input and whether the function suceeded
 */
const getMovieById = async (id) => {
    try {
        // try to get the movie by the id
        const movie = await Movie.findById(id);
        if (!movie) {
            // if the movie is not exist return null
            return null;
        }
        // return the movie
        return movie;
    } catch (error) {
        // if the error because the movie is not exist
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // return null
            return null;
        }
        // if there was error throw it
        throw new Error('Error fetching user by ID: ' + error.message);
    }
}

/**
 * Deletes a movie
 * @param {Movie's ID, string} id 
 * @returns movie, null or error
 */
const deleteMovie = async (id) => {
    try {
        // try to get the movie
        const movie = await getMovieById(id);

        // if the movie is not exist return null
        if (movie == null) {
            return null;
        }

        await User.updateMany(
            { movies: id },
            { $pull: { movies: id } }
        );
        // delete the movie
        await movie.deleteOne();
        return movie;
    }
    catch (error) {
        // if there was an error throw it
        throw new Error('Error deleting category: ' + error.message);
    }
}

/**
 * Swaps a movie's settings with new ones, or creates an altogether movie if the requested ID does not exist
 * @param {the movie's ID, string} id 
 * @param {movie schema, all fields that belong to a movie} movieData 
 * @returns movie, null or error, depending on the result
 */
const putMovie = async (id, movieData) => {
    try { 

        const categoryDocs = await Promise.all(newMovieData.categories.map(id => Category.findById(id)));
        if (categoryDocs.includes(null)) {
            return null;
        }

        const newMovie = await Movie.findOneAndReplace(
            { _id: id }, 
            movieData,          
                { new: true, upsert: true }
        );

        return newMovie; 
    }
    catch (error) {
        throw new Error('Error putting movie: ' + error.message);
    }
};


module.exports = {createMovie, get20MoviesByCategory, getMovieById, deleteMovie, putMovie};