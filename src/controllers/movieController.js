const movieService = require('../services/movieService');
const categoryService = require('../services/categoryService');

/**
 * POST
 * @param {name, published, actors, thumbnail, description, length, categories} req 
 * @param {status} res 
 */
const createMovie = async (req, res) => {
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
        return res.status(400).json({ errors: [error.message] });
    }
};

/**
 * Adds category to movie using movieService
 * @param {movieID, categoryID} req 
 * @param {status} res 
 * @returns 
 */
const addCategoryToMovie = async (req, res) => {
    const {movieID, catID} = req.body

    try {
        const result = await movieService.addCategoryToMovie(movieID, catID);
        if (result == null) {
            return res.status(404).json({ errors: ['Invalid request'] });
        }
        return res.status(200).json({});
    }

    catch (error) {
        return res.status(400).json({ errors: ['Internal server error: ' + error.message] })
    }
}

/**
 * GET
 * Showcase up to 20 random movies from each category which is promoted
 * @param {} req 
 * @param {Status, and assuming the function succeeded, movies} res 
 */
const getMoviesByCategories = async (req, res) => {
    try {
        // Get all promoted
        const categories = await categoryService.getAllCategories();
        const promotedCategories = categories.filter(category => category.promoted);

        // Get up to 20 movies of each categ, using the function from movieService
        const moviesByCategoryPromises = promotedCategories.map(async (category) => {
            const movies = await movieService.get20MoviesByCategory(category._id);
            return { category: category.name, movies };
        });
        // Wait for all the searches to finish
        const moviesByCategory = await Promise.all(moviesByCategoryPromises);
        res.status(200).json(moviesByCategory);
    } 
    catch (error) {
        res.status(400).json({ errors: ['Internal server error: ' + error.message] });
    }
};

/**
 * Returns a movie using the function from movieService
 * @param {Movie's ID} req 
 * @param {error/movie} res 
 * @returns 
 */
const getMovieById = async (req, res) => {
    try {
        // get the movie by his ID from the service
        const movie = await movieService.getMovieById(req.params.id);
        if (movie == null) {
            // if the movie not exist return not found
            return res.status(404).json({ errors: ['User not found'] });
        }
        // if the movie exists return the movie
        return res.status(200).json(movie);
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({ errors: ['An error occurred: ' + error.message] });
    }
}

/**
 * Deletes a movie using the function from movieService POGGERS
 * @param {Movie's ID} req 
 * @param {movie/error} res 
 */
const deleteMovie = async (req, res) => {
    try {
        // try to delete the movie
        const movie = await movieService.deleteMovie(req.params.id);

        if (movie == null) {
            // if the movie null so the movie is not exist
            return res.status(404).json({ errors: ['Movie does not exist'] });
        }

        // if the movie exists return the movie
        return res.status(200).json(movie);
    }
    catch (error) {
        // if there was error return error message
        return res.status(400).json({ errors: ['An error occurred: ' + error.message] });
    }
}


module.exports = {createMovie, addCategoryToMovie, getMoviesByCategories, getMovieById, deleteMovie};