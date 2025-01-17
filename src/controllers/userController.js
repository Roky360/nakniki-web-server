const userService = require('../services/userService');
const {parseSchemaErrors} = require("../utils/errorUtils");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

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
        return res.status(201).location(`api/users/${user._id}`).json();
    } catch (err) {
        return res.status(400).json({errors: parseSchemaErrors(err)});
    }
};

const getUserById = async (req, res) => {
    // get the user by his ID from the service
    const user = await userService.getUserById(req.params.id);

    if (user == null) {
        // if the user not exist return not found
        return res.status(404).json({error: 'User not found'});
    }
    // exclude sensitive and irrelevant fields
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.recom_id;
    delete userObj.first_watch;

    // if the user exists return the user
    return res.status(200).json(userObj);
};

const isUserExist = async (req, res) => {
    // get the username and password from the req
    const username = req.body.username;
    const password = req.body.password;

    // check if the user exist
    const userExist = await userService.isUserExist(username, password);
    if (!userExist.success) {
        // if the user not exist
        return res.status(404).json({error: userExist.message});
    }

    // get the user and return his id
    const user = await userService.getUserByUsernameAndPassword(username, password);
    // prepare auth token
    const data = {timestamp: Date.now().toString(), user_id: user._id.toString()}
    const token = jwt.sign(data, JWT_SECRET)
    return res.status(200).json({token});
};

module.exports = {createUser, getUserById, isUserExist};