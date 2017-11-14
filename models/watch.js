const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let WatchSchema = new Schema({
	crn: {type: String, required: true},
	email: {type: String, required: true},
	term: {type: String, required: true},
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	termFriendly: String,
	title: String,
	courseTitle: String,
	courseNumber: String,
	sectionNumber: String,
	emailSent: Boolean,
	isActive: {type: Boolean, default: true},
	resolvedDate: Date
}, {timestamps: true});

WatchSchema.pre('save', function (next) {

	if (!this.isModified('term'))
		return next();

	//converts the term number to a human-friendly semester name and year
	let year = this.term.toString().substring(0, 4);
	let semesterNumber = this.term.toString().substring(4);
	let semesterString;
	switch (semesterNumber){
	case '10':
		semesterString = 'Fall';
		year--;
		break;
	case '20':
		semesterString = 'Spring';
		break;
	case '30':
		semesterString = 'Summer';
		break;

	}
	this.termFriendly = semesterString + ' ' + year;
	next();

});

module.exports = mongoose.model('Watch', WatchSchema);