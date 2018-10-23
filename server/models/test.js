const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');


let TestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    where: {
        type: String,
        required: true
    }
});






let Test = mongoose.model('Test', TestSchema);

module.exports = {Test}
