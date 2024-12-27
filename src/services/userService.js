const User = require('../models/userModel');

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

const isUserExist = async (username, password) => {
    try {
        // try to find the user by name and password and return it
        const user = await User.findOne({ username, password });
        return user !== null;
    } catch (error) {
        // if there was an error throw it
        throw new Error('Error checking user existence: ' + error.message);
    }
};

const getUserByUsernameAndPassword = async (username, password) => {
    return await User.findOne({ username, password });
};

module.exports = {createUser, getUserById, isUserExist, getUserByUsernameAndPassword};