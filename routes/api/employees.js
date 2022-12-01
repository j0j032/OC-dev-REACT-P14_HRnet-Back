const express = require('express')
const router = express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})
const employeesController = require('../../controllers/employeesController')


//upload.multiple('image', 'data')

router.route('/')
	// route = http://localhost:3500/employees
	.get(employeesController.getAllEmployees)
	.post(upload.single('image'), employeesController.createNewEmployee)
	.put(employeesController.updateEmployee)
	.delete(employeesController.deleteEmployee)

router.route('/:id')
	// route = http://localhost:3500/employees/:id
	.get(employeesController.getEmployee)


module.exports = router
