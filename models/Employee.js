const mongoose = require('mongoose')
const Schema = mongoose.Schema

const employeeSchema = new Schema({
	firstname: {
		type: String,
		required: true
	},
	lastname: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	department: {
		type: String,
		required: true
	},
	hired: {
		type: Date,
		required: true
	},
	birthdate: {
		type: Date,
		required: true
	},
	picture: {
		type: String,
		required: true
	},
	contact: {
		mail: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		}
	},
	address: {
		street: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		},
		state: {
			type: String,
			required: true
		},
		zip: {
			type: String,
			required: true
		}
	}
})

// Mongo will create a collections of employeeS in lowercase
module.exports = mongoose.model('Employee', employeeSchema)