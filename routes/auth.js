const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.route('/')
	.post(authController.handleLogin)
router.route('/logout')
	.get(authController.handleLogout)
router.route('/refresh')
	.get(authController.handleRefreshToken)

module.exports = router
