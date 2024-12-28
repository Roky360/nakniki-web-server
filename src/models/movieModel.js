const mongoose = require('mongoose');
const categoryModel = require('./categoryModel');
const Schema = mongoose.Schema;

// Assistant function, to ensure that the entered date is valid
const isValidDate = (value) => {
    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};


// define the movie
const UserModel = new Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    published : {
        type: String,
        required: true,
        // Ensures that the entered date is valid using the helper function 
        validate: {
            validator: isValidDate,
            message: 'Please use a valid date format: DD/MM/YYYY'
        }
    },
    actors : {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.every(actor => typeof actor === 'string' && actor.trim() !== '');
            },
            message: 'Actors should be an array of non empty strings seperated by commas.'
        }
    },
    thumbnail: {
        type: String,
        required: true
    },
    descryption: {
        type: String,
        required: true
    },
    length: {
        type: Number,
        required: true
    },
    // RETURN HERE
    category: [
        {
        type: mongoose.Schema.Types.ObjectId, // Reference Category model
        ref: 'categoryModel', // Name of the Category model
        }
    ]
});

module.exports = mongoose.model('movies', MovieModel, 'movies');