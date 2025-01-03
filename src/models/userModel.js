const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordValidator = (password) => {
    if (typeof password !== 'string') return false; // Ensure it's a string
    // check minimum length
    if (password.length < 6) return false;
    // check for spaces
    if (password.includes(' ')) return false;
    // check for at least one uppercase letter
    if (!password.split('').some(char => char >= 'A' && char <= 'Z')) return false;
    // check for at least one digit
    if (!password.split('').some(char => char >= '0' && char <= '9')) return false;
    // check for at least one special character
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return password.split('').some(char => specialChars.includes(char));
}

// define the user schema
const UserModel = new Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: [true, "This username is occupied, try a different one."],
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        validate: {
            validator: passwordValidator,
            message: 'Password must not contain whitespaces, be at least 6 characters long and contain one capital letter, one number and one symbol.'
        }
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        // validate email format
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    profile_pic: {
        type: String,
        required: [true, "Profile picture is required."]
    },
    recom_id: {
        type: Number
    },
    first_watch: {
        type: Boolean,
        default: true
    },
    movies: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference Movie model
            ref: 'movies', // Name of the Movie model
            default: []
        }
    ]
});

module.exports = mongoose.model('users', UserModel, 'users');