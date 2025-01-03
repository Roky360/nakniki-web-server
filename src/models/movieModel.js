const mongoose = require('mongoose');
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
const MovieModel = new Schema({
    name: {
        type: String,
        required: [true, "Movie name is required."],
        unique: [true, "Movie with this name already exists."]
    },
    published: {
        type: String,
        required: [true, "Published date is required."],
        // Ensures that the entered date is valid using the helper function 
        validate: {
            validator: isValidDate,
            message: 'Please use a valid date format: DD/MM/YYYY'
        }
    },
    actors: {
        type: [String],
        required: [true, "Actors list is required."],
        validate: {
            validator: function (arr) {
                return arr.length > 0 && arr.every(actor => typeof actor === 'string' && actor.trim() !== '');
            },
            message: 'Actors should be an array of non empty strings seperated by commas.'
        }
    },
    thumbnail: {
        type: String,
        required: [true, "Movie thumbnail is required."]
    },
    description: {
        type: String,
        required: [true, "Movie description is required."]
    },
    length: {
        type: Number,
        required: [true, "Movie length is required."]
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference Category model
            ref: 'categories', // Name of the Category model
        }
    ],
    recom_id: {
        type: Number
    }
});

module.exports = mongoose.model('movies', MovieModel, 'movies');
