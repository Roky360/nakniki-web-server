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
    const userDoc = User.findById(userId);
    if (userDoc === null) {
        throw new Error('User does not exist');
    }
    const movieDoc = Movie.findById(movieId);
    if (movieDoc === null) {
        throw new Error('Movie does not exist');
    }
    // if the movie is already in the user's watched list - return 400 bad request
    if (userDoc.get('movies').contains(movieId)) {
        throw new Error('Movie already watched by this user');
    }

    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');
    try {
        // decide whether to send POST or PATCH request
        if (userDoc.get('first_watch') === true) {
            // it's the user's first watch - POST
            userDoc.updateOne({'first_watch': false});
            await sendRequest(`POST ${userRecomId} ${movieRecomId}`);
        } else {
            // PATCH
            await sendRequest(`PATCH ${userRecomId} ${movieRecomId}`);
        }
        // add the movie id to the watched array of the user
        await userDoc.updateOne({$push: {'movies': movieId}});
    } catch (err) {
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
    const userDoc = User.findById(userId);
    if (userDoc === null) {
        throw new Error('User does not exist');
    }
    const movieDoc = Movie.findById(movieId);
    if (movieDoc === null) {
        throw new Error('Movie does not exist');
    }

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
 * @returns {Promise<{code, payload}>}
 */
exports.recommend = async (userId, movieId) => {
    const res = await sendRequest(`GET ${userId} ${movieId}`);

    if (res.status === 200) {
        res.payload = res.payload.split(' '); // convert the recommended movie list to an array
    }
    return res;
}
