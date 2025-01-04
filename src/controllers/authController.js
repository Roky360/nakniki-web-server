const authService = require('../services/authService');

const authUser = async (req, res, next) => {
    if (!await authService.authenticateUser(req.headers['user_id'])) {
        return res.status(401).json({errors: authService.AuthFailedMsg});
    }
    next();
}

module.exports = {authUser};
