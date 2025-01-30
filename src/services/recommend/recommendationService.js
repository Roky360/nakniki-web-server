const User = require('../../models/userModel');
const Movie = require('../../models/movieModel');
const recomModel = require('../../models/recommendationModel');
const {sendRequest} = require('./recommendationSendingService');

const globalCounterName = "global_recom_counter";

/**
 * Generates a unique ID for the recommendation system.
 */
const generateRecomId = async () => {
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
 * @returns Movie document - if operation was successful.
 * @throws Error if user/movie does not exist.
 */
const markAsWatched = async (userId, movieId) => {
    // get user and movies docs and check they exist
    let userDoc;
    let movieDoc;
    try {
        userDoc = await User.findById(userId);
        movieDoc = await Movie.findById(movieId);
    } catch (_) {
        return {
            success: false,
            msg: "Invalid user or movie ID."
        };
    }
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');
    try {
        // decide whether to send POST or PATCH request
        if (userDoc.get('first_watch') === true) {
            // it's the user's first watch - POST
            await sendRequest(`POST ${userRecomId} ${movieRecomId}`).then(async (res) => {
                if (res.status !== 201) {
                    await sendRequest(`PATCH ${userRecomId} ${movieRecomId}`);
                }
            });
            // set first_watch to false
            userDoc.first_watch = false;
            await userDoc.save({validateBeforeSave: false});
        } else {
            // PATCH
            await sendRequest(`PATCH ${userRecomId} ${movieRecomId}`);
        }
        // add the movie id to the watched array of the user
        await userDoc.updateOne({$addToSet: {'movies': movieId}});

        return {
            success: true,
            movie: movieDoc
        };
    } catch (err) {
        return {
            success: false,
            msg: err.message
        };
    }
}

/**
 * Marks a movie as unwatched by a user. Sends a request to the recommendation server and updates the user's watched array.
 * @param userId
 * @param movieId
 * @returns Movie document if operation was successful, or null if something went wrong.
 */
const markAsUnwatched = async (userId, movieId) => {
    // get user and movies docs and check they exist
    let userDoc;
    let movieDoc;
    try {
        userDoc = await User.findById(userId);
        movieDoc = await Movie.findById(movieId);
    } catch (_) {
        return {
            success: false,
            msg: "Invalid user or movie ID."
        };
    }
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');
    try {
        await sendRequest(`DELETE ${userRecomId} ${movieRecomId}`);
        await userDoc.updateOne({$pull: {'movies': movieId}});
        return {success: true};
    } catch (err) {
        return {
            success: false,
            msg: err.message
        };
    }
}

/**
 * Gets movie recommendations from the server and returns an object with the status code and, if request was successful,
 * an array of the recommended movies.
 * @param userId
 * @param movieId
 * @returns {Promise<{success, msg | movies}>}
 */
const recommend = async (userId, movieId) => {
    // get user and movies docs and check they exist
    let userDoc;
    let movieDoc;
    try {
        userDoc = await User.findById(userId);
        movieDoc = await Movie.findById(movieId);
    } catch (_) {
        return {
            success: false,
            msg: "Invalid user or movie ID."
        };
    }
    // get recommendation IDs
    const userRecomId = userDoc.get('recom_id');
    const movieRecomId = movieDoc.get('recom_id');
    try {
        const res = await sendRequest(`GET ${userRecomId} ${movieRecomId}`);
        // if we got a valid response and there are recommendations in the "payload"
        if (res.status === 200 && res.payload) {
            // convert the recommended movies to an array of numbers
            const movieRecomIds = res.payload.split(' ')
                .slice(0, -1)
                .map(e => Number(e));

            return {
                success: true,
                movies: await getMoviesByRecomId(movieRecomIds)
            };
        } else {
            return {
                success: true,
                movies: []
            }
        }
    } catch (err) {
        return {
            success: false,
            msg: err
        };
    }
}

/**
 * Returns movie docs from given recommendation IDs array.
 * @param recomIds Recommendation IDs of the movies.
 * @returns Movies documents that corresponds to those IDs.
 */
const getMoviesByRecomId = async (recomIds) => {
    if (!recomIds) {
        return [];
    }
    return Movie.find({recom_id: {$in: recomIds}});
}

module.exports = {generateRecomId, recommend, markAsUnwatched, markAsWatched};
