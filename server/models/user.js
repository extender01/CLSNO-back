const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


//=========  SCHEMA

let UserSchema = new mongoose.Schema({
    nick: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});




//========== INSTANCE METHODS

//For Signup and Login, creates jwt for requesting user (this..), toHexString because original type is ObjectID, salt in environment variable defined in config.json
//generates token, saves to db under previously created particular user and returns token as resolved promise value to be later send back to user as x-auth header in routing
UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access: access}, process.env.JWT_SECRET).toString();

    //add token to particular user in db, ES6 object notation
    user.tokens = user.tokens.concat([{access, token}])

    return user.save().then(() => {
        return token
    });
};


//overrides original method to return only some desired data in res.send
UserSchema.methods.toJSON = function () {
    let user = this;
    let userJSObject = user.toObject() //convert mongo object to classic JS object

    return _.pick(userJSObject, ['_id', 'nick'])
};


//remove token
UserSchema.methods.removeToken = function (token) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};




//=========== MODEL METHODS

// For Login, find user by nick and check input password and hashed password in db
UserSchema.statics.findByCredentials = function (nick, password) {
    let User = this;

    return User.findOne({nick: nick}).then((foundUser) => {
        if (!foundUser) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, foundUser.password, (err, res) => {
                if (res) {
                    resolve(foundUser)
                } else {
                    reject(err);
                }
            });
        });
    });
};





//for authenticate, when invoked with token, checks if token is valid, decodes its data and searches db for user (token owner) - if bad, returns rejected promise and ends
UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decodedToken;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};



//============= MIDDLEWARE

//mongoose middleware, if password of particular was changed, then hash it and save hashed version to db
UserSchema.pre('save', function (next) {
    let user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next()
            });
        });
    } else {
        next();
    }
});

let User = mongoose.model('User', UserSchema);


module.exports = {User};