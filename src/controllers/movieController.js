const movieService = require('../services/movieService');
const categoryService = require('../services/categoryService');
const {parseSchemaErrors} = require("../utils/errorUtils");
const path = require("path");

/**
 * POST
 * @param {name, published, actors, thumbnail, description, length, categories} req
 * @param {status} res
 */
const createMovie = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: 'Thumbnail not provided or invalid.'});
    }
    const pathFormatted = req.file.path.replace(/\\/g, '/');
    const thumbnailRelPath = path.join("/api", pathFormatted.substring(pathFormatted.indexOf("/uploads"))).replace(/\\/g, '/');

    try {
        // Using the movieService createMovie function
        const movie = await movieService.createMovie(
            req.body.name,
            req.body.published,
            req.body.actors,
            thumbnailRelPath,
            req.body.description,
            req.body.length,
            req.body.categories
        );

        return res.status(201).location(`api/movies/${movie._id}`).json();
    } catch (error) {
        // In case of an error, return status 400 and the error msg
        return res.status(400).json({errors: parseSchemaErrors(error)});
    }
};

/**
 * GET
 * Showcase up to 20 random movies from each category which is promoted
 * @param {} req
 * @param {Status, and assuming the function succeeded, movies} res
 */
const getMoviesByCategories = async (req, res) => {
    const userID = req.headers['user_id'];
    // Get all promoted
    const categories = await categoryService.getAllCategories();
    const promotedCategories = categories.filter(category => category.promoted);

    // Get up to 20 movies of each categ, using the function from movieService
    const moviesByCategoryPromises = promotedCategories.map(async (category) => {
        const movies = await movieService.get20MoviesByCategory(category._id, userID);
        return {category: category.name, movies};
    });

    const moviesByCategory = await Promise.all(moviesByCategoryPromises);

    // Adds the watched movies to their separate category, if there are any
    if (userID) {
        const watchedCategory = await movieService.getWatchedMovies(userID);
        moviesByCategory.push(watchedCategory);
    }

    res.status(200).json(moviesByCategory);
};

/**
 * Returns a movie using the function from movieService
 * @param {Movie's ID} req
 * @param {error/movie} res
 * @returns
 */
const getMovieById = async (req, res) => {
    // get the movie by his ID from the service
    const movie = await movieService.getMovieById(req.params.id);
    if (movie == null) {
        // if the movie not exist return not found
        return res.status(404).json({error: 'Movie not found'});
    }
    // if the movie exists return the movie
    return res.status(200).json(movie);
}

/**
 * DELETE
 * @param {Movie's ID} req
 * @param {movie/error} res
 */
const deleteMovie = async (req, res) => {
    try {
        // try to delete the movie
        const movie = await movieService.deleteMovie(req.params.id);

        if (movie == null) {
            // if the movie null so the movie is not exist
            return res.status(404).json({error: 'Movie not found'});
        }

        // if the movie exists return the movie
        return res.status(204).json();
    } catch (error) {
        return parseSchemaErrors(error);
    }
}

/**
 * PUT
 * if ID does not exist, creates a new movie instead of editing it
 * @param {ID, all standard movie parameters} req
 * @param {status} res
 * @returns movie, or an error, depending on input
 */
const putMovie = async (req, res) => {
    const result = await movieService.putMovie(req.params.id, req.body)

    // upon error return the error message
    if (!result.success) {
        if (result.found) {
            return res.status(400).json({errors: result.msg});
        }
        return res.status(404).json({error: result.msg});
    }
    // upon success
    if (result.created) {
        res.status(201).location(`api/movies/${result.msg._id}`).json();
    } else {
        return res.status(204).json();
    }
}


/**
 * GET movies/:query
 * Returns a list of all movies that matches the given query.
 */
const searchMovies = async (req, res) => {
    const query = req.params.query;
    try {
        const results = await movieService.searchMovies(query);
        res.status(200).json(results);
    } catch (err) {
        res.status(400).json({errors: parseSchemaErrors(err)});
    }
}

const getAllMoviesByCategories = async (req, res) => {
    const catDocs = await categoryService.getAllCategories();
    const moviesByCategories = catDocs.map(async (category) => {
        return {
            category: category.name,
            movies: await movieService.getMoviesByCategory(category._id)
        }
    });
    return moviesByCategories;
}

module.exports = {
    createMovie,
    getMoviesByCategories,
    getMovieById,
    deleteMovie,
    putMovie,
    searchMovies,
    getAllMoviesByCategories,
};