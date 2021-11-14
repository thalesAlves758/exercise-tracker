const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: String,
    log: [{
        description: String,
        duration: Number,
        date: Date
    }]
});

module.exports.User = model('User', userSchema);
