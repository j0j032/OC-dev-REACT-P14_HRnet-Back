const Employee = require('../models/Employee')
const {uploadFile} = require('./s3PicturesController')
const {json} = require('express')
const {capitalize, formatPhoneNumber, formatToLocale} = require('../utils/formater')
const {getStateAbbreviation} = require('../utils/getStateAbbreviation')

const getAllEmployees = async (req, res) => {
	if (req.query.limit === 'null' || req.query.limit === 'undefined' || req.query.limit === undefined)
		return res.status(400).json({'message': 'Bad Request, the query param should be a number'})
	
	const page = req.query.page < 0 || null ? 0 : req.query.page || 0
	const limit = req.query.limit || 12
	const text = req.query.text || ''
	
	const employeesLength = await Employee.count()
	const employees = await Employee
		.find({
			$or: [
				{firstname: {$regex: text, $options: 'i'}},
				{lastname: {$regex: text, $options: 'i'}},
				{hired: {$regex: text, $options: 'i'}},
				{department: {$regex: text, $options: 'i'}},
				{birthdate: {$regex: text, $options: 'i'}},
				{'address.street': {$regex: text, $options: 'i'}},
				{'address.city': {$regex: text, $options: 'i'}},
				{'address.state': {$regex: text, $options: 'i'}},
				{'address.zip': {$regex: text, $options: 'i'}}
			]
		})
		.sort({lastname: 1})
		.skip(page * limit)
		.limit(limit)
	
	if (!employees) return res.status(204).json({'message': 'No employees found.'})
	res.json({employees, employeesLength})
}

const createNewEmployee = async (req, res) => {
	if (!req?.body?.employee || !req?.body?.company || !req?.file) {
		return res.status(400).json({'message': 'The entire form should be filled including image'})
	}
	const receivedEmployee = JSON.parse(req.body.employee)
	const newEmployeeCompany = JSON.parse(req.body.company)
	
	const newEmployee = {
		firstname: capitalize(receivedEmployee.firstname),
		lastname: capitalize(receivedEmployee.lastname),
		birthdate: formatToLocale(receivedEmployee.birthdate, 'en-US'),
		title: capitalize(receivedEmployee.title),
		department: receivedEmployee.department,
		hired: formatToLocale(receivedEmployee.startDate, 'en-US'),
		contact: {
			mail: receivedEmployee.mail,
			phone: receivedEmployee.phone
		},
		address: {
			street: receivedEmployee.street,
			city: capitalize(receivedEmployee.city),
			state: getStateAbbreviation(receivedEmployee.state),
			zip: receivedEmployee.zip
		},
		company: {
			id: newEmployeeCompany.id,
			name: newEmployeeCompany.name,
			logo: newEmployeeCompany.logo
		}
	}
	const fileName = newEmployee.firstname + newEmployee.lastname + newEmployee.birthdate.split('/').join('')
	console.log('filename:', fileName)
	
	try {
		await uploadFile(req.file.buffer, fileName, req.file.mimetype)
		
		const result = await Employee.create({
			picture: fileName,
			firstname: newEmployee.firstname,
			lastname: newEmployee.lastname,
			birthdate: newEmployee.birthdate,
			title: newEmployee.title,
			department: newEmployee.department,
			hired: newEmployee.hired,
			contact: newEmployee.contact,
			address: newEmployee.address,
			company: newEmployee.company
		})
		res.status(201).json(result)
		
	} catch (err) {
		console.log(err)
	}
}

const updateEmployee = async (req, res) => {
	if (!req.body?.id) return res.status(400).json({'message': 'ID parameter is required.'})
	const employee = await Employee.findOne({_id: req.body.id}).exec()
	
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${req.body.id}.`})
	if (req.body?.firstname) employee.firstname = req.body.firstname
	if (req.body?.lastname) employee.lastname = req.body.lastname
	const result = await employee.save()
	res.json(result)
}

const deleteEmployee = async (req, res) => {
	if (!req.body?.id) return res.status(400).json({'message': 'Employee ID required.'})
	const employee = await Employee.findOne({_id: req.body.id}).exec()
	
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${req.body.id}.`})
	const result = await employee.deleteOne({_id: req.body.id})
	res.json(result)
}

const getEmployee = async (req, res) => {
	if (!req.params?.id) return res.status(400).json({'message': 'Employee ID required.'})
	const employee = await Employee.findOne({_id: req.params.id}).exec()
	
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${req.params.id}.`})
	res.json(employee)
}

module.exports = {getAllEmployees, getEmployee, createNewEmployee, updateEmployee, deleteEmployee}
