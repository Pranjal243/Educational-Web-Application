var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	unique_id: Number,
	phone: String,
	username: String,
	school: String,
	class: String,
	password: String,
	passwordConf: String,
	admin: {
		type: Boolean,
		default:false
	}
}),
User = mongoose.model('User', userSchema);

module.exports = User;