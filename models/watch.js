var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatchSchema = new Schema({
    crn:{type:String, required: true},
    email:{type:String, required:true},
    term:{type:String, required:true},
    userID: Schema.Types.ObjectId,
    termFriendly:String,
    title:String,
    courseTitle:String,
    courseNumber: String,
    sectionNumber:String,
    emailSent:Boolean,
    isActive:{type:Boolean, default:true},
    enteredDate:{type:Date, default: Date.now()},
    resolvedDate: Date
});

WatchSchema.pre('save',function (next) {
    //converts the term number to a human-friendly semester name and year
    var year = this.term.toString().substring(0,4);
    var semesterNumber = this.term.toString().substring(4);
    console.log(year);
    console.log(semesterNumber);
    var semesterString;
    switch (semesterNumber){
        case "10":
            semesterString = "Fall";
            year--;
            break;
        case "20":
            semesterString = "Spring";
            break;
        case "30":
            semesterString = "Summer";
            break;

    }
    this.termFriendly = semesterString + " " + year;
    console.log(this.termFriendly);
    next();

});

module.exports = mongoose.model('Watch', WatchSchema);