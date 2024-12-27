const Movie = require('../models/movieModel');

const createMovie = async (name, published, actors, thumbnail, descryption, length, categories) => {
    // try to create new movie
    try {
        const movie = new Movie({});
        return await movie.save();
    }
    catch (error) { 
        // In case of an error
        throw new Error('Error creating movie: ' + error.message);
    }
};

const getMovieByID = async (id) => {
    try {
        // Get a movie using its ID
        const movie = await Movie.findById(id);
        if (!movie) {
            // In case there is no movie with such ID
            return null;
        }
        return movie;
    } catch (error) {
        // in case the movie does not exist:
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // return null
            return null;
        }
        // Otherwise:
        throw new Error('Error fetching movie by ID: ' + error.message);
    }
};

const isMovieExist = async (name) => {
    try {
        // Try to find a movie by its name
        const movie = await Movie.findOne({name});
        return movie !== null;
    } catch (error) {
        // In case of an error
        throw new Error('Error checking movie existence: ' + error.message);
    }
};

const getMovieByName = async (name) => {
    try {
        const movie = await Movie.findOne({name});
        return movie;
    } catch (error) {
        // In case of an error
        throw new Error('Error checking movie existence: ' + error.message);
    }
};

module.exports = {createMovie, getMovieByID, isMovieExist, getMovieByName};