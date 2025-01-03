const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryModel = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required."],
        unique: [true, "Category name is occupied."],
        validate: {
            validator: (name) => name.trim() && name !== "Watched",
            message: 'Category name cannot be "Watched".'
        }
    },
    promoted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('categories', categoryModel, 'categories');
