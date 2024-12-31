const User = require('../models/userModel');

const AuthFailedMsg = "Authentication failed (provide a valid user_id header).";

/**
 * Authenticates a user given its auth-token.
 * @param token User auth token.
 * @returns {Promise<boolean>}
 */
const authenticateUser = async (token) => {
    if (!token) {
        return false;
    }
    try {
        // checks if the user exists
        return User.findById(token) !== null;
    } catch (err) {
        return false;
    }
}

module.exports = {AuthFailedMsg, authenticateUser};
