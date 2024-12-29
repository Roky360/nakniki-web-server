const User = require('../models/userModel');
const recommendationService = require('../services/recommend/recommendationService');

const createUser = async (username, password, email, profile_pic) => {
    // try to create new user
    try {
        const user = new User({
            username,
            password,
            email,
            profile_pic,
            recom_id : await recommendationService.generateRecomId()
        });
        return await user.save();
    }
    catch (error) { // if there was problem trow the error
        throw new Error('Error creating user: ' + error.message);
    }
};

const getUserById = async (id) => {
    try {
        // try to get the user by the id
        const user = await User.findById(id);
        if (!user) {
            // if the user is not exist return null
            return null;
        }
        // return the user
        return user;
    } catch (error) {
        // if the error because the user is not exist
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // return null
            return null;
        }
        // if there was error throw it
        throw new Error('Error fetching user by ID: ' + error.message);
    }
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
    try {
        // try to find the user
        const user = await User.findOne({ username, password });

        if (!user) {
            // if the user now found return null
            return null;
        }
        // return the user
        return user;
    }
    catch (error) {
        throw new Error('Error fetching user by username and password: ' + error.message);
    }
};

module.exports = {createUser, getUserById, isUserExist, getUserByUsernameAndPassword};