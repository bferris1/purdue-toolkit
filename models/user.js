var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {type:String,required:true,index:{unique:true}},
    password: {type:String, required:true, select:false},
    phone:String,
    premium:{type:Boolean, default:false},
    resetToken:String,
    resetExpiration:Date

});


UserSchema.pre('save',function (next) {

    var user = this;

    if (!user.isModified('password'))
        return next();

    bcrypt.hash(user.password,10, null, function(err, hash){
        user.password = hash;
        next();
    })

});

UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bcrypt.compareSync(password,user.password);

};


module.exports = mongoose.model('User', UserSchema);