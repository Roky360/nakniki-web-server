const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define the user schema
const UserModel = new Schema({
    username : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        // validate email format
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    profile_pic : {
        type: String,
        required: true
    },
    recom_id : {
      type : Number
    },
    first_watch : {
        type : Boolean,
        default : true
    },
    movies : {
        type : [Number],
        default : []
    }
});

module.exports = mongoose.model('users', UserModel, 'users');