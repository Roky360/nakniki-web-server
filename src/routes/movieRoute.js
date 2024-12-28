const express = require('express');
var router = express.Router();

const movieController = require('../controllers/movieController');

router.route('/').post(movieController.createMovie);
router.route('/').get(movieController.getMoviesByCategories);

module.exports = router;