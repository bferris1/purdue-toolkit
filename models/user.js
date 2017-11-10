var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {type:String,required:true,index:{unique:true}},
    password: {type:String, required:false, select:false},
    phone:String,
    pushoverKey:String,
    resetToken:String,
    resetExpiration:Date,
    googleId: String

});


UserSchema.pre('save',function (next) {

    var user = this;

    if (!user.isModified('password'))
        return next();

    bcrypt.hash(user.password,null, null, function(err, hash){
        //todo: error handling
        user.password = hash;
        next();
    })

});

UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bcrypt.compareSync(password,user.password);
};


module.exports = mongoose.model('User', UserSchema);