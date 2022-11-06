require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3500

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
