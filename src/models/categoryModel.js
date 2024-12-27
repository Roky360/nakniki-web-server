const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryModel = new Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    promoted : {
        type : Boolean,
        default : false
    }
});

module.exports = mongoose.model('categories', categoryModel, 'categories');