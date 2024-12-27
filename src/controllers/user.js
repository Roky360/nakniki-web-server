const userService = require('../services/user');

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(
            req.body.username,
            req.body.password,
            req.body.email,
            req.body.profile_pic
        );
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ errors: [error.message] });
    }
};

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ errors: ['user not found'] });
    }
    res.json(user);
};

module.exports = {createUser, getUserById};