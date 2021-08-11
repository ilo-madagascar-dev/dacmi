const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET ='thesecretjwtsecret';

mongoose.connect('mongodb://localhost:27017/login-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
});

const app = express();

app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());

app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;

    const user = await User.findOne({username}).lean();

    if (!user) {
        return res.json({status:'error', error: 'Invalid username/password'});    
    }

    if (await bcrypt.compare(password, user.password)) {
        //the username password combination is successful
        const token = jwt.sign({
            id: user._id, 
            username: user.username
        }, JWT_SECRET);

        return res.json({status:'ok', data:token});
    }

    res.json({status: 'ok', data:'Coming soon'});
});

app.post('/api/register', async (req, res) => {
    //console.log(req.body);
    
    const {username, password:plainTextPassword} = req.body;
    
    if (!username || typeof username !== 'string') {
        return res.json({status: 'error', error: 'Invalid username'});
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({status: 'error', error: 'Invalid password'});
    }

    if (plainTextPassword.length < 5) {
        return res.json({status: 'error', error: 'The password is too short : the password should be at least 6 characters'});
    }

    const password = await bcrypt.hashSync(plainTextPassword, 10);

    try {
        const response = await User.create({
            username, 
            password
        });

        console.log(response);

        console.log('User created successfully');
    } catch (error) {
        if (error.code === 11000) {
            
            console.log(JSON.stringify( error));
            return res.json({status:'error', error:'Username already in use'});
        }
        throw error;
    }
    res.json({ status: 'ok' });
});

app.listen(9999, () => {
    console.log('Server up at 9999');
});