const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	firstname: String,
	lastname: String,
	picture: String,
	title: String,
	email: String,
	company: {
		name: String,
		logo: String
	},
	roles: {
		User: {
			type: Number,
			default: 2001
		},
		Editor: Number,
		Admin: Number
	},
	password: {
		type: String,
		required: true
	},
	refreshToken: String
})

// Mongo will create a collections of employeeS in lowercase
module.exports = mongoose.model('User', userSchema)
