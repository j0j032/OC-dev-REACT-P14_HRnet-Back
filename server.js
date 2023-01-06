require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const app = express()
const PORT = process.env.PORT || 3500
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const {logger, logEvents} = require('./middlewares/logger')
const errorHandler = require('./middlewares/errorHandler')
const cookieParser = require('cookie-parser')


connectDB()
app.use(logger)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: false}))

app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/auth'))


app.use('/employees', require('./routes/employees'))

app.all('*', (req, res) => {
	res.status(404)
	if (req.accepts('html')) {
		res.sendFile(path.join(__dirname, 'views', '404.html'))
	} else if (req.accepts('json')) {
		res.json({error: '404 Not Found'})
	} else {
		res.type('txt').send('404 Not Found')
	}
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB')
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
	console.log(err)
	logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
