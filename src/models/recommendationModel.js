const mongoose = require("mongoose");

const recomModel = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    value: {
        type: Number,
        default: 1,
    }
});

module.exports = mongoose.model('Recom', recomModel, 'recommendations');
