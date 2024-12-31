const movieService = require('../services/movieService');
const categoryService = require('../services/categoryService');
const authService = require("../services/authService");

/**
 * POST
 * @param {name, published, actors, thumbnail, description, length, categories} req
 * @param {status} res
 */
const createMovie = async (req, res) => {
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    try {
        // Using the movieService createMovie function
        const movie = await movieService.createMovie(
            req.body.name,
            req.body.published,
            req.body.actors,
            req.body.thumbnail,
            req.body.description,
            req.body.length,
            req.body.categories
        );
        if (movie === null) {
            return res.status(404).json({message: 'Invalid input!'});
        }
        // Return status 201 created
        return res.status(201).json(movie);
    } catch (error) {
        // In case of an error, return status 400 and the error msg
        return res.status(400).json({errors: [error.message]});
    }
};

/**
 * GET
 * Showcase up to 20 random movies from each category which is promoted
 * @param {} req
 * @param {Status, and assuming the function succeeded, movies} res
 */
const getMoviesByCategories = async (req, res) => {
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    try {
        const userID = req.headers['user-id'];
        // Get all promoted
        const categories = await categoryService.getAllCategories();
        const promotedCategories = categories.filter(category => category.promoted);

        // Get up to 20 movies of each categ, using the function from movieService
        const moviesByCategoryPromises = promotedCategories.map(async (category) => {
            const movies = await movieService.get20MoviesByCategory(category._id, userID);
            return {category: category.name, movies};
        });

        if (userID) {
            const watchedCategory = await movieService.getWatchedMovies(userID);
            moviesByCategoryPromises.push(Promise.resolve(watchedCategory));
        }

        // Wait for all the searches to finish
        const moviesByCategory = await Promise.all(moviesByCategoryPromises);
        res.status(200).json(moviesByCategory);
    } catch (error) {
        res.status(400).json({errors: ['Internal server error: ' + error.message]});
    }
};

/**
 * Returns a movie using the function from movieService
 * @param {Movie's ID} req
 * @param {error/movie} res
 * @returns
 */
const getMovieById = async (req, res) => {
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    try {
        // get the movie by his ID from the service
        const movie = await movieService.getMovieById(req.params.id);
        if (movie == null) {
            // if the movie not exist return not found
            return res.status(404).json({errors: ['Movie not found']});
        }
        // if the movie exists return the movie
        return res.status(200).json(movie);
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({errors: ['An error occurred: ' + error.message]});
    }
}

/**
 * DELETE
 * @param {Movie's ID} req
 * @param {movie/error} res
 */
const deleteMovie = async (req, res) => {
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    try {
        // try to delete the movie
        const movie = await movieService.deleteMovie(req.params.id);

        if (movie == null) {
            // if the movie null so the movie is not exist
            return res.status(404).json({errors: ['Movie not found']});
        }

        // if the movie exists return the movie
        return res.status(204).json(movie);
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({errors: ['An error occurred: ' + error.message]});
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
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    try {
        const movie = await movieService.putMovie(req.params.id, req.body)

        if (movie === null) {
            // if the movie null so the movie is not exist
            return res.status(400).json({errors: ['Invalid input']});
        }

        return res.status(200).json(movie);
    } catch (error) {
        return res.status(400).json({errors: ['Bad requests ' + error.message]});
    }
}


/**
 * GET movies/:query
 * Returns a list of all movies that matches the given query.
 */
const searchMovies = async (req, res) => {
    // auth user
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }

    const query = req.params.query;
    try {
        const results = await movieService.searchMovies(query);
        res.status(200).json(results);
    } catch (err) {
        res.status(400).json({errors: [err]});
    }
}

module.exports = {createMovie, getMoviesByCategories, getMovieById, deleteMovie, putMovie, searchMovies};