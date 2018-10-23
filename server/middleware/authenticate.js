let {User} = require('../models/user');



//findByToken checks if token is valid and finds and returns that user as promise resolved value
//then checks if user was found in db and if so, append retreived data to req object to be used in app routing
let authenticate = (req, res, next) => {
    //let token = req.header('x-auth');
    let token = req.cookies['x-auth']
    console.log('v authenticate je token:', token);
    
    
    User.findByToken(token).then((matchedUser) => {
        if (!matchedUser) {
            return Promise.reject();
        }

        //adding data to req object for later usage in routing
        req.user = matchedUser;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send(e);
    });
};

module.exports = {authenticate};
