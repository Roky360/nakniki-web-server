const express = require('express');
const router = express.Router();

const {authUser} = require('../controllers/authController');
const movieController = require('../controllers/movieController');
const recommendController = require('../controllers/recommendController');

router.route('/')
    .post(authUser, movieController.createMovie)
    .get(authUser, movieController.getMoviesByCategories);

router.route('/:id')
    .get(authUser, movieController.getMovieById)
    .delete(authUser, movieController.deleteMovie)
    .put(authUser, movieController.putMovie);

router.route('/:id/recommend')
    .post(authUser, recommendController.addWatchedMovie)
    .get(authUser, recommendController.recommendMovies)

router.route('/search/:query')
    .get(authUser, movieController.searchMovies);

router.route('/all')
    .get(authUser, movieController.getAllMoviesByCategories)

module.exports = router;
