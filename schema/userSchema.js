const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    firstName : {type:String, require:true},
    lastName : {type:String, require:true},
    email:{
        type:String,
        lowercase:true,
        require:true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    password:{type:String, require:true},
    role:{type:String, default:'user'},
    emailVerify:{type:String, default:'N'},
    tempOTP:{type:String, default:null},
    createdAt:{type:String, default:new Date()}
}, {collection:'users', versionKey:false})

const userModel = mongoose.model('users', UserSchema)

module.exports= {userModel}