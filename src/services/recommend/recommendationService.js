const User = require('../../models/userModel');
const recomModel = require('../../models/recommendationModel');
const {sendRequest} = require('recommendationSendingService');

const globalCounterName = "global_recom_counter";

/**
 * Generates a unique ID for the recommendation system.
 */
exports.generateRecomId = async () => {
    const counterDoc = await recomModel.findOneAndUpdate(
        {name: globalCounterName},
        {$inc: {value: 1}},
        {new: true}
    );

    return counterDoc.value;
}

/**
 * Marks a movie as watched by a user in the recommendation system.
 * @param userId Recommendation user id.
 * @param movieId Recommendation movie id.
 * @returns void
 * @throws Error if user/movie does not exist.
 */
exports.markAsWatched = async (userId, movieId) => {
    const userDoc = User.findById(userId);
    if (userDoc === null) {
        throw new Error('User does not exist');
    }
    // TODO: make sure the movie exist, similar to this ^

    const userRecomid = userDoc.get('recom_id');
    // TODO: get movie recom id the same way
    const movieRecomId = null;

    // decide whether to send POST or PATCH request
    if (userDoc.get('first_watch') === true) {
        // it's the user's first watch - POST
        userDoc.updateOne({'first_watch': false});
        await sendRequest(`POST ${userRecomid} ${movieRecomId}`);
    } else {
        // PATCH
        await sendRequest(`PATCH ${userRecomid} ${movieRecomId}`);
    }
}

exports.recommend = async (userId, movieId) => {
    const res = await sendRequest(`GET ${userId} ${movieId}`);

    if (res.status === 200) {
        res.payload = res.payload.split(' '); // convert the recommended movie list to an array
    }
    return res;
}

exports.markAsUnwatched = async (userId, movieId) => {
    return sendRequest(`DELETE ${userId} ${movieId}`);
}
