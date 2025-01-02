const recommendationService = require('../services/recommend/recommendationService');
const userService = require('../services/userService');
const movieService = require('../services/movieService');
const {parseSchemaErrors} = require("../utils/errorUtils");

/**
 * GET /movies/:id/recommend
 *
 * Fetches a recommendation from the recommendation server.
 * @return 200 OK upon success and recommended movies in payload.
 * 400 upon failure or invalid arguments.
 */
exports.recommendMovies = async (req, res) => {
    const userId = req.headers['user_id'];
    const movieId = req.params.id;
    // argument checks
    if (!userId || !movieId) {
        return res.status(400).json({error: "User and movie IDs required"});
    }
    if (await userService.getUserById(userId) === null) {
        return res.status(400).json({error: 'User not found'});
    }
    if (await movieService.getMovieById(movieId) === null) {
        return res.status(400).json({error: 'Movie not found'});
    }

    const serverRes = await recommendationService.recommend(userId, movieId);
    if (serverRes.success) {
        res.status(200).json(serverRes.movies);
    } else {
        res.status(400).json({errors: parseSchemaErrors(serverRes.msg)});
    }
}

/**
 * POST /movies/:id/recommend
 *
 * Marks movie as watched by a user in the recommendation server.
 * @returns 201 upon success.
 * 400 upon failure with error message in payload.
 */
exports.addWatchedMovie = async (req, res) => {
    const userId = req.headers['user_id'];
    const movieId = req.params.id;
    // argument checks
    if (!userId || !movieId) {
        return res.status(400).json({error: "User and movie IDs required"});
    }
    if (await userService.getUserById(userId) === null) {
        return res.status(400).json({error: 'User not found'});
    }
    if (await movieService.getMovieById(movieId) === null) {
        return res.status(400).json({error: 'Movie not found'});
    }

    try {
        const result = await recommendationService.markAsWatched(userId, movieId);
        res.status(204).json();
    } catch (err) {
        res.status(400).json({errors: parseSchemaErrors(err)});
    }
}
