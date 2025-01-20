const User = require('../models/userModel');
const recommendationService = require('../services/recommend/recommendationService');

const createUser = async (username, password, email, profile_pic) => {
    // create new user
    const user = new User({
        username,
        password,
        email,
        profile_pic,
        recom_id: await recommendationService.generateRecomId()
    });

    // Save the new user to the database
    return await user.save();
};

const getUserById = async (id) => {
    try {
        // try to get the user by the id
        const user = await User.findById(id);
        if (!user) {
            // if the user is not exist return null
            return null;
        }
        return user;
    } catch (error) {
        // invalid id (cannot be cast to ObjectId)
        return null;
    }
};

const isUserExist = async (username, password) => {
    // if didn't get the username or the error
    if (!username || !password) {
        return {success: false, message: 'Didnt get username or/and password'};
    }

    try {
        // try to find the user by name and password and return it
        const user = await User.findOne({username, password});
        if (user) {
            return {success: true};
        } else {
            return {success: false, message: 'User not found'};
        }
    } catch (error) {
        // if there was an error return false
        return {success: false, message: error.message};
    }
};

const isAdmin = async (userId) => {
    const userDoc = await getUserById(userId);
    if (!userDoc) {
        return false;
    }
    return userDoc.get('is_admin');
}

const getUserByUsernameAndPassword = async (username, password) => {
    try {
        // try to find the user
        const user = await User.findOne({username, password});

        if (!user) {
            // if the user now found return null
            return null;
        }
        // return the user
        return user;
    } catch (error) {
        throw new Error('Error fetching user by username and password: ' + error.message);
    }
};

module.exports = {createUser, getUserById, isUserExist, isAdmin, getUserByUsernameAndPassword};