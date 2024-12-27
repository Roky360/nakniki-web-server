const userService = require('../services/userService');

const createUser = async (req, res) => {
    try {
        // create the user using the user service
        const user = await userService.createUser(
            req.body.username,
            req.body.password,
            req.body.email,
            req.body.profile_pic
        );
        // return status 201 created
        res.status(201).json(user);
    } catch (error) {
        // if there was error return error message
        res.status(500).json({ errors: [error.message] });
    }
};

const getUserById = async (req, res) => {
    // get the user by the id from the service
    const user = await userService.getUserById(req.params.id);
    if (!user) {
        // is the user isnt exist return status 404 not found
        return res.status(404).json({ errors: ['user not found'] });
    }
    // return the user
    res.status(200).json(user);
};

const isUserExist = async (req, res) => {
    // get the username and password from the req
    const username = req.body.username;
    const password = req.body.password;

    try {
        // check if the user exist
        const userExists = await userService.isUserExist(username, password);

        if (userExists) {
            // f user exist get him and return the user id
            const user = await userService.getUserByUsernameAndPassword(username, password);
            return res.status(200).json({ userId: user._id });
        } else {
            // if user doesnt exist return error message
            return res.status(404).json({ errors: ['User not found'] });
        }
    } catch (error) {
        // if there was error return error message
        return res.status(500).json({ errors: ['Internal server error: ' + error.message] });
    }
};

module.exports = {createUser, getUserById, isUserExist};