require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const app = express()
const PORT = process.env.PORT || 3500
const {logger} = require('./middlewares/logger')
const errorHandler = require('./middlewares/errorHandler')
const cookieParser = require('cookie-parser')

app.use(logger)
app.use(cors(corsOptions))
app.use(express.urlencoded({extended: false}))

app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))

app.use('/', require('./routes/root'))

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
