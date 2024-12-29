const User = require('../../models/userModel');
const Movie = require('../../models/movieModel');
const recomModel = require('../../models/recommendationModel');
const {sendRequest} = require('./recommendationSendingService');

const globalCounterName = "global_recom_counter";

/**
 * Generates a unique ID for the recommendation system.
 */
exports.generateRecomId = async () => {
    const counterDoc = await recomModel.findOneAndUpdate(
        {name: globalCounterName},
        {$inc: {value: 1}},
        {new: true, upsert: true, setDefaultsOnInsert: true}
    );

    return counterDoc.value;
}

/**
 * Marks a movie as watched by a user in the recommendation system; also updates the user's watched array.
 * @param userId Recommendation user id.
 * @param movieId Recommendation movie id.
 * @returns void
 * @throws Error if user/movie does not exist.
 */
exports.markAsWatched = async (userId, movieId) => {
    // get user and movies docs and check they exist
    const userDoc = await User.findById(userId);
    const movieDoc = await Movie.findById(movieId);
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');

    try {
        // decide whether to send POST or PATCH request
        if (userDoc.get('first_watch') === true) {
            // it's the user's first watch - POST
            await sendRequest(`POST ${userRecomId} ${movieRecomId}`);
            // set first_watch to false
            userDoc.first_watch = false;
            await userDoc.save();
        } else {
            // PATCH
            await sendRequest(`PATCH ${userRecomId} ${movieRecomId}`);
        }
        // add the movie id to the watched array of the user
        await userDoc.updateOne({$addToSet: {'movies': movieId}});

        return {movie_id: movieId};
    } catch (err) {
        throw err;
    }
}

/**
 * Marks a movie as unwatched by a user. Sends a request to the recommendation server and updates the user's watched
 * array.
 * @param userId
 * @param movieId
 * @returns {Promise<void>}
 */
exports.markAsUnwatched = async (userId, movieId) => {
    // get user and movies docs and check they exist
    const userDoc = await User.findById(userId);
    const movieDoc = await Movie.findById(movieId);
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');
    try {
        await sendRequest(`DELETE ${userRecomId} ${movieRecomId}`);
        await userDoc.updateOne({$pull: {'movies': movieId}});
    } catch (err) {
    }
}

/**
 * Gets movie recommendations from the server and returns an object with the status code and, if request was successful,
 * an array of the recommended movies.
 * @param userId
 * @param movieId
 * @returns {Promise<{status, movies}>}
 */
exports.recommend = async (userId, movieId) => {
    // get user and movies docs and check they exist
    const userDoc = await User.findById(userId);
    const movieDoc = await Movie.findById(movieId);
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');

    try {
        const res = await sendRequest(`GET ${userRecomId} ${movieRecomId}`);
        // convert the recommended movies to an array of numbers
        const movieRecomIds = res.payload.split(' ')
            .slice(0, -1)
            .map(e => Number(e));

        return {
            status: res.status,
            movies: await getMoviesByRecomId(movieRecomIds)
        };
    } catch (err) {
        return {
            status: 400,
            movies: err
        };
    }
}

const getMoviesByRecomId = async (recomIds) => {
    if (!recomIds) {
        return [];
    }
    return Movie.find({recom_id: {$in: recomIds}});
}
