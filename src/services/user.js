const User = require('../models/user');

const createUser = async (username, password, email, profile_pic) => {
    // try to create new user
    try {
        const user = new User({username, password, email, profile_pic});
        return await user.save();
    }
    catch (error) { // if there was problem trow the error
        throw new Error('Error creating user: ' + error.message);
    }
};

const getUserById = async (id) => {
    return await User.findById(id);
};

module.exports = {createUser, getUserById};