const recommendationService = require('../services/recommend/recommendationService');

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
    if (!userId || !movieId) {
        return res.status(400).json({errors: "User and movie IDs required"});
    }

    const serverRes = await recommendationService.recommend(userId, movieId);
    if (serverRes.code === 200) {
        res.status(200).json(serverRes.payload);
    } else {
        res.status(serverRes.code).json({errors: serverRes.payload});
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
    if (!userId || !movieId) {
        return res.status(400).json({errors: "User and movie IDs required"});
    }

    try {
        await recommendationService.markAsWatched(userId, movieId);
        res.status(201);
    } catch (err) {
        res.status(400).json({errors: err});
    }
}
