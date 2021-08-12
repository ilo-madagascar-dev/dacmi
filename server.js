const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET ='thesecretjwtsecret';

mongoose.connect('mongodb://localhost:27017/dacmi', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
});

const app = express();

app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());


app.post('/api/change-password', async (req, res) => 
{
    const { token, newpassword } = req.body;

    if (!newpassword || typeof newpassword !== 'string') {
        return res.json({status: 'error', error: 'Invalid password'});
    }

    if (newpassword.length < 5) {
        return res.json({status: 'error', error: 'The password is too short : the password should be at least 6 characters'});
    }

    try {
        const user = jwt.verify( token, JWT_SECRET );

        console.log('user : ', user);
        console.log(newpassword);
        const _id = user.id;
        console.log(_id);

        const hashedPassword = await bcrypt.hash(newpassword,10);
        
        console.log(hashedPassword);

        await User.updateOne({_id}, {
            $set: {
                password:hashedPassword
            }
        });

        res.json({status:'ok'});

    } catch (error) {
        console.log(error);

        return res.json({status: 'error', error: 'Requête non autorisée !!!'});        
    } 

});

app.post('/api/login', async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).lean();

    if (!user) {
        return res.json({status:'error', error: 'Invalid email/password'});    
    }

    if (await bcrypt.compare(password, user.password)) {
        //the email password combination is successful
        const token = jwt.sign({
            id: user._id, 
            email: user.email
        }, JWT_SECRET);

        return res.json({status:'ok', data:{email, password, token}});
    }

    res.json({status: 'error', error:'Invalid credentials'});
});

app.post('/api/register', async (req, res) => {
    
    let {firstname, secondname, email, password:plainTextPassword, confirmpassword, phonenumber, renemberme, subscribenews} = req.body;
    
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailVerification = re.test(String(email).toLowerCase());
    
    //console.log(renemberme, subscribenews);
    
    if (emailVerification !== true) {
        return res.json({status: 'error', error: 'Vous devez rentrer un format d\'e-mail valide'});
    }

    if (!email || typeof email !== 'string') {
        return res.json({status: 'error', error: 'Invalid username'});
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({status: 'error', error: 'Invalid password'});
    }

    if (plainTextPassword.length < 5) {
        return res.json({status: 'error', error: 'The password is too short : the password should be at least 6 characters'});
    }

    if (!confirmpassword || typeof confirmpassword !== 'string') {
        return res.json({status: 'error', error: 'Veuillez confirmer votre mot de passe !!!'});
    }

    if (confirmpassword  !== plainTextPassword) {
        return res.json({status: 'error', error: 'Le mot de passe et la confirmation du mot de passe doivent être les mêmes !!!'});
    }

    if(renemberme == true){
        renemberme = true;
    }else {
        renemberme = false;
    }

    if(subscribenews == true){
        subscribenews = true;
    }else {
        subscribenews = false;
    }

    const password = await bcrypt.hashSync(plainTextPassword, 10);

    try {
        const response = await User.create({
            email,
            firstname,
            secondname, 
            password,
            phonenumber,
            renemberme,
            subscribenews
        });

        console.log(response);

        console.log('User created successfully');
    } catch (error) {
        if (error.code === 11000) {
            
            console.log(JSON.stringify( error));
            return res.json({status:'error', error:'E-mail déjà utilisé !!!'});
        }
        throw error;
    }
    res.json({ status: 'ok' });
});

app.listen(9999, () => {
    console.log('Server up at 9999');
});