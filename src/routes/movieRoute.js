const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');

router.route('/')
    .post(movieController.createMovie)
    .get(movieController.getMoviesByCategories);

router.route('/search/:query')
    .get(movieController.searchMovies);

module.exports = router;
