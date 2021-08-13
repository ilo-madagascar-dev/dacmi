const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
{
    email: {type:String, required:true, unique:true},
    firstname: {type:String, required:true},
    lastname: {type:String, required:true},
    password: {type:String, required:true},
    phone: {type:String, required:true},
    remember: {type:Boolean, required:true},
    news: {type:Boolean, required:true}
}, 
{ 
    collection: 'users'
});

const model = mongoose.model('UserSchema', UserSchema);

module.exports = model;