const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
{
    email: {type:String, required:true, unique:true},
    firstname: {type:String, required:true},
    secondname: {type:String, required:true},
    password: {type:String, required:true},
    phonenumber: {type:String, required:true},
    renemberme: {type:Boolean, required:true},
    subscribenews: {type:Boolean, required:true}
}, 
{ 
    collection: 'users'
});

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;