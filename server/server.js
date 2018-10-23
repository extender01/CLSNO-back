require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Test} = require('./models/test');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

const corsOptions = {
    exposedHeaders: 'x-auth',
  };
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());





app.get('/', (req, res) => {
    
    Test.find({}).then((foundTests) => {
        console.log(req.cookies['x-auth']);
        
        
        res.send(foundTests);
    });
});


// ========== ADD TEST
app.post('/addtest', authenticate, (req, res) => {
    //_.pick pulls selected props from req.body and puts them to extractedProps object
    let extractedProps = _.pick(req.body, ['name', 'where']);   
    let test = new Test(extractedProps);         //creates new mongoose model
    test.save().then((savedTest) => {
        console.log(savedTest)
        res.send(savedTest);
    }).catch((e) => {res.status(400).send(e);})
});

//==============EDIT TEST
app.patch('/tests/:id', (req, res) => {
    let id = req.params.id;
    let updates = _.pick(req.body, ['name', 'where']);

    Test.findByIdAndUpdate(id, {$set: updates}, {new: true}).then((updatedTest) => {
        if (!updatedTest) {
            return res.status(404).send();
        }
        res.send(updatedTest);
    }).catch((e) => {
        res.status(400).send(e);
    });
});


// ============ SIGN UP=================================
app.post('/adduser', (req, res) => {
    let extractedProps = _.pick(req.body, ['nick', 'password']);
    let user = new User(extractedProps)

    user.save().then((savedUser) => {
        return user.generateAuthToken();
    }).then((retreivedToken) => {
        res.header('x-auth', retreivedToken).send(user);
    }).catch((e) => {
        res.status(400).send(e)
    });
});


//=============== LOGIN=============================================
app.post('/login', (req, res) => {
    let extractedProps = _.pick(req.body, ['nick', 'password']);

    User.findByCredentials(extractedProps.nick, extractedProps.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            console.log('token', token);
           // res.header('x-auth', token).send(user);
           res.cookie('x-auth', token).send(user);
        }).catch((e) => {
            res.status(400).send(e);
        });
    }).catch((e) => {
        res.status(400).send(e);
    })
});



//===========================WHOISLOGGED======================================

app.get('/me', authenticate, (req, res) => {
    console.log('v get/me je token:', req.cookies['x-auth']);
    
    res.send(req.user)
});




//=================== LOGOUT
//req.user.removeToken and req.token are accessible cause of authenticate middleware which appends them to req object
app.delete('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send('uspesne odhlasen')
    }).catch((e) => {
        res.status(400).send(e);
    });
});











app.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });
  
  module.exports = {app};
