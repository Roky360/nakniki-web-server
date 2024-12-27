const userService = require('../services/movieService');

const createMovie = async (req, res) => {
    try {
        // Using the movieService createMovie function
        const movie = await movieService.createMovie(
            req.body.name,
            req.body.published,
            req.body.actors,
            req.body.thumbnail,
            req.body.descryption,
            req.body.length,
            req.body.categories
        );
        // Return status 201 created
        res.status(201).json(movie);
    } catch (error) {
        // In case of an error, return status 400 and the error msg
        res.status(400).json({ errors: [error.message] });
    }
};

const getMovieById = async (req, res) => {
    try {
        // Using the function from MovieService
        const movie = await movieService.getMovieById(req.params.id);
        if (movie == null) {
            // In case the movie does not exist, return status 404
            return res.status(404).json({ errors: ['Movie not found'] });
        }
        // In case the movie exists, returns it along with a status 200
        res.status(200).json(user);
    } catch (error) {
        // Otherwise, return an error and sttaus 400
        res.status(400).json({ errors: ['An error occurred: ' + error.message] });
    }
};

const isMovieExist = async (req, res) => {
    // get the movie name
    const username = req.body.name;

    try {
        // Use the function from MovieService
        const movieExists = await movieService.isMovieExist(name);

        if (movieExists) {
            // Returns the ID of the movie in case it exists
            const user = await userService.getUserByUsernameAndPassword(username, password);
            return res.status(200).json({ userId: user._id });
        } else {
            // if user doesnt exist return error message
            return res.status(404).json({ errors: ['User not found'] });
        }
    } catch (error) {
        // if there was error return error message
        return res.status(400).json({ errors: ['Internal server error: ' + error.message] });
    }
};

module.exports = {createUser, getUserById, isUserExist};