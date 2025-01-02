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
 * @param {A quick descryption of the movie's plot, string} description
 * @param {The length of the movie in minutes, number} length
 * @param {The categories' IDs that the movie belongs to, ex: horror or action, Category[]} categories
 * @returns
 */
const createMovie = async (name, published, actors, thumbnail, description, length, categories) => {
    // Validate the category IDs
    const categoryDocs = await Promise.all(
        categories.map(async (id) => await categoryService.getCategoryById(id))
    );

    // Returns an error if at least one category is incorrect, bad users deserve punishment >:D
    const invalidCategories = categoryDocs.filter(category => category === null);
    if (invalidCategories.length > 0) {
        throw new Error("One or more of the categories doesn't exist.");
    }

    // Makes sure the movie has al least one category
    const validCategories = categoryDocs.filter(category => category !== null);
    if (validCategories.length === 0) {
        throw new Error("The movie has to be in at least one category.");
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
};

/**
 * @param {the category's ID} catID
 * @param userID
 * @returns up to 20 random movies from that category
 */
const get20MoviesByCategory = async (catID, userID) => {
    // If the category does not exist, or is not promoted, do not show it
    const category = await Category.findById(catID);
    if (!category || !category.promoted) {
        return [];
    }

    // Fetch user's watched movies if a userID is provided
    let watchedMovies = [];
    if (userID) {
        const user = await User.findById(userID);
        if (user?.movies?.length) {
            watchedMovies = user.movies;
        }
    }

    // Get 20 random movies of that category
    const movies = await Movie.aggregate([
        {
            $match: {
                categories: catID,
                _id: {$nin: watchedMovies} // Exclude watched movies
            }
        },
        {$sample: {size: 20}}
    ]);

    return movies;
};

/**
 * @param {The movie's ID, string} id
 * @returns movie, null, or error, depending on the input and whether the function suceeded
 */
const getMovieById = async (id) => {
    try {
        const movie = await Movie.findById(id);
        if (!movie) {
            // if the movie is not exist return null
            return null;
        }
        return movie;
    } catch (error) {
        // if the ID cannot be cast to ObjectID (invalid)
        return null;
    }
}

/**
 * Deletes a movie
 * @param {Movie's ID, string} id
 * @returns movie, null or error
 */
const deleteMovie = async (id) => {
    // try to get the movie
    const movie = await getMovieById(id);
    // if the movie is not exist return null
    if (movie == null) {
        return null;
    }

    // finds all users who watched the movie
    const usersWithMovie = await User.find({movies: id});

    // Use markAsUnwatched for each user
    let success = true;
    await Promise.all(
        usersWithMovie.map(async (user) => {
            const result = await recommendationService.markAsUnwatched(user._id, id);
            success = success && result.success;
        })
    );
    // if one of the deletions failed
    if (!success) {
        throw new Error("Failed to delete from recommendation server.");
    }

    // delete the movie
    await movie.deleteOne();
    return movie;
}

/**
 * Swaps a movie's settings with new ones, or creates an altogether movie if the requested ID does not exist
 * @param {the movie's ID, string} id
 * @param {movie schema, all fields that belong to a movie} movieData
 * @returns movie, null or error, depending on the result
 */
const putMovie = async (id, movieData) => {
    try {
        // Check if the movie exists
        const existingMovie = await Movie.findById(id);

        // Validate the category IDs
        const categoryDocs = await Promise.all(
            movieData.categories.map(async (id) => await categoryService.getCategoryById(id))
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

        const validCategoryIds = validCategories.map(category => category._id);
        const validActorList = movieData.actors.split(',').map(actor => actor.trim());

        let recom_id;

        if (existingMovie) {
            recom_id = existingMovie.recom_id;
        } else {
            recom_id = await recommendationService.generateRecomId();
        }

        // Build the updated movie object
        const updatedMovieData = {
            name: movieData.name,
            published: movieData.published,
            actors: validActorList,
            thumbnail: movieData.thumbnail,
            description: movieData.description,
            length: movieData.length,
            categories: validCategoryIds,
            recom_id,
        };

        // Create a new movie instance for validation
        const movieToValidate = new Movie(updatedMovieData);

        // Validate the data explicitly
        await movieToValidate.validate();

        const newMovie = await Movie.findOneAndReplace(
            {_id: id},
            updatedMovieData,
            {new: true, upsert: true}
        );


        return newMovie;

    } catch (error) {
        throw new Error('Error putting movie: ' + error.message);
    }
};

/**
 * Returns up to 20 of the user's previously watched movies
 * @param {ID, user's id} userId
 * @returns error or up to 20 movies
 */
const getWatchedMovies = async (userId) => {
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user || !user.movies || user.movies.length === 0) {
            return {category: 'Watched', movies: []}; // Return empty category if no watched movies
        }

        // Fetch up to 20 random watched movies
        const watchedMovies = await Movie.aggregate([
            {
                $match: {
                    _id: {$in: user.movies}
                }
            },
            {$sample: {size: 20}} // Randomly select up to 20 movies
        ]);

        return {category: 'Watched', movies: watchedMovies};
    } catch (error) {
        throw new Error('Error fetching watched movies category: ' + error.message);
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
module.exports = {
    createMovie,
    get20MoviesByCategory,
    getMovieById,
    deleteMovie,
    putMovie,
    getWatchedMovies,
    searchMovies,
};