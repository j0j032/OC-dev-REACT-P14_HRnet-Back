const express = require('express')
const router = express.Router()
const employeesController = require('../../controllers/employeesController')

router.route('/')
	// route = http://localhost:3500/employees
	.get(employeesController.getAllEmployees)
	.post(employeesController.createNewEmployee)
	.put(employeesController.updateEmployee)
	.delete(employeesController.deleteEmployee)

router.route('/:id')
	// route = http://localhost:3500/employees/:id
	.get(employeesController.getEmployee)


module.exports = router
