const authService = require('../services/authService');
const userService = require('../services/userService');

/**
 * Authenticates a user with jwt.
 */
const authUser = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1]; // extract the token
        const userId = await authService.authenticateUser(token);
        if (!userId) {
            return res.status(401).json({errors: authService.AuthFailedMsg});
        }
        // set userId for next middlewares
        req.headers.user_id = userId;
    } else {
        return res.status(403).json({error: 'Auth token required'});
    }

    next();
}

/**
 * Authenticates an admin user.
 */
const authAdmin = async (req, res, next) => {
    if (!await userService.isAdmin(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AdminAuthFailMsg});
    }
    next();
}

module.exports = {authUser, authAdmin};
