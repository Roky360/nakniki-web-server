const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');
const recommendController = require('../controllers/recommendController');

router.route('/')
    .post(movieController.createMovie)
    .get(movieController.getMoviesByCategories);

router.route('/:id/recommend')
    .post(recommendController.addWatchedMovie)
    .get(recommendController.recommendMovies)

router.route('/search/:query')
    .get(movieController.searchMovies);

module.exports = router;
