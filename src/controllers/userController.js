const userService = require('../services/userService');

const createUser = async (req, res) => {

    // create the user using the user service
    const user = await userService.createUser(
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.profile_pic
    );

    if (!user.success) {
        // if there was a problem return the error
        return res.status(404).json({ error : [user.message] });
    }

    // return status 201 created
    return res.status(201).json(user.user);
};

const getUserById = async (req, res) => {
    try {
        // get the user by his ID from the service
        const user = await userService.getUserById(req.params.id);
        if (user == null) {
            // if the user not exist return not found
            return res.status(404).json({ errors: ['User not found'] });
        }
        // if the user exists return the user
        return res.status(200).json(user);
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({ errors: ['An error occurred: ' + error.message] });
    }
};

const isUserExist = async (req, res) => {
    // get the username and password from the req
    const username = req.body.username;
    const password = req.body.password;

    // check if the user exist
    const userExist = await userService.isUserExist(username, password);
    if (!userExist.success) {
        // if the user not exist
        return res.status(404).json({ error : [userExist.message] });
    }

    // get the user and return his id
    const user = await userService.getUserByUsernameAndPassword(username, password);
    return res.status(200).json({ userId: user._id });
};

module.exports = {createUser, getUserById, isUserExist};