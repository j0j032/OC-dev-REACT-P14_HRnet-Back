const Employee = require('../models/Employee')
const {json} = require('express')
const {uploadFile, getObjectSignedUrl, deleteFile} = require('./s3PicturesController')
const {capitalize, formatPhoneNumber, formatToLocale, titleCase} = require('../utils/formater')
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
				//<editor-fold desc=" _MATCH_ ">
				{firstname: {$regex: text, $options: 'i'}},
				{lastname: {$regex: text, $options: 'i'}},
				{hired: {$regex: text, $options: 'i'}},
				{department: {$regex: text, $options: 'i'}},
				{birthdate: {$regex: text, $options: 'i'}},
				{'address.street': {$regex: text, $options: 'i'}},
				{'address.city': {$regex: text, $options: 'i'}},
				{'address.state': {$regex: text, $options: 'i'}},
				{'address.zip': {$regex: text, $options: 'i'}}
				//</editor-fold>
			]
		})
		.sort({lastname: 1})
		.skip(page * limit)
		.limit(limit)
	
	if (!employees) return res.status(204).json({'message': 'No employees found.'})
	for (let employee of employees) {
		employee.imageUrl = await getObjectSignedUrl(employee.picture)
	}
	res.json({employees, employeesLength})
}

const createNewEmployee = async (req, res) => {
	if (!req?.body?.employee || !req?.body?.company) {
		return res.status(400).json({'message': 'The entire form should be filled including image'})
	}
	const receivedEmployee = JSON.parse(req.body.employee)
	const newEmployeeCompany = JSON.parse(req.body.company)
	
	const newEmployee = {
		//<editor-fold desc="DEFINE AND FORMAT">
		firstname: titleCase(receivedEmployee.firstname),
		lastname: titleCase(receivedEmployee.lastname),
		birthdate: receivedEmployee.birthdate,
		title: titleCase(receivedEmployee.title),
		department: receivedEmployee.department,
		hired: receivedEmployee.startDate,
		contact: {
			mail: receivedEmployee.mail,
			phone: formatPhoneNumber(receivedEmployee.phone)
		},
		address: {
			street: receivedEmployee.street,
			city: titleCase(receivedEmployee.city),
			state: receivedEmployee.state,
			stateAbb: getStateAbbreviation(receivedEmployee.state),
			zip: receivedEmployee.zip
		},
		company: {
			id: newEmployeeCompany.id,
			name: newEmployeeCompany.name,
			logo: newEmployeeCompany.logo
		}
		//</editor-fold>
	}
	const fileName = req.file ? newEmployee.firstname + newEmployee.lastname + newEmployee.birthdate.split('/').join('') : 'none'
	console.log('filename:', fileName)
	
	try {
		if (req.file) {
			await uploadFile(req.file.buffer, fileName, req.file.mimetype)
		}
		const result = await Employee.create({
			//<editor-fold desc="SET FIELDS">
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
			//</editor-fold>
		})
		res.status(201).json(result)
		
	} catch (err) {
		console.log(err)
	}
}

const updateEmployee = async (req, res) => {
	if (!req?.body?.employee) {
		return res.status(400).json({'message': 'Bad request'})
	}
	const receivedEmployee = JSON.parse(req.body.employee)
	
	if (!receivedEmployee._id) return res.status(400).json({'message': 'ID parameter is required.'})
	const employee = await Employee.findOne({_id: receivedEmployee._id}).exec()
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${receivedEmployee._id}.`})
	
	if (req.file && receivedEmployee) {
		const fileName = receivedEmployee.firstname + receivedEmployee.lastname + receivedEmployee.birthdate.split('/').join('')
		employee.picture = receivedEmployee.picture === 'none' ? fileName : receivedEmployee.picture
		await uploadFile(req.file.buffer, employee.picture, req.file.mimetype)
	}
	if (receivedEmployee && !req.file) {
		//<editor-fold desc="UPDATE FIELDS">
		employee.firstname = titleCase(receivedEmployee.firstname)
		employee.lastname = titleCase(receivedEmployee.lastname)
		employee.birthdate = receivedEmployee.birthdate
		employee.title = titleCase(receivedEmployee.title)
		employee.department = receivedEmployee.department
		employee.hired = receivedEmployee.startDate
		employee.contact.mail = receivedEmployee.mail
		employee.contact.phone = formatPhoneNumber(receivedEmployee.phone)
		employee.address.street = receivedEmployee.street
		employee.address.city = titleCase(receivedEmployee.city)
		employee.address.state = receivedEmployee.state
		employee.address.stateAbb = getStateAbbreviation(receivedEmployee.state)
		employee.address.zip = receivedEmployee.zip
		//</editor-fold>
	}
	const result = await employee.save()
	res.json(result)
}

const deleteEmployee = async (req, res) => {
	if (!req.body?.id) return res.status(400).json({'message': 'Employee ID required.'})
	const employee = await Employee.findOne({_id: req.body.id}).exec()
	
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${req.body.id}.`})
	
	await deleteFile(employee.picture)
	const result = await employee.deleteOne({_id: req.body.id})
	res.json(result)
}

const getEmployee = async (req, res) => {
	if (!req.params?.id) return res.status(400).json({'message': 'Employee ID required.'})
	const employee = await Employee.findOne({_id: req.params.id}).exec()
	
	if (!employee) return res.status(204).json({'message': `No employee matches ID ${req.params.id}.`})
	employee.imageUrl = await getObjectSignedUrl(employee.picture)
	
	res.json(employee)
}

module.exports = {getAllEmployees, getEmployee, createNewEmployee, updateEmployee, deleteEmployee}
