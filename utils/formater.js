const formatToLocale = (date, zone) => {
	const newDate = Date.parse(date)
	const ts = new Date(newDate)
	return ts.toLocaleDateString(zone)
}

function formatDateToTimestamp(date) {
	let d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear()
	if (month.length < 2) month = '0' + month
	if (day.length < 2) day = '0' + day
	return [year, month, day].join('')
}


function formatPhoneNumber(phoneNumberString) {
	let cleaned = ('' + phoneNumberString).replace(/\D/g, '')
	let match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
	if (match) {
		let intlCode = (match[1] ? '+1 ' : '')
		return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
	}
	return phoneNumberString
}

const capitalize = value => (value && value[0].toUpperCase() + value.slice(1).toLowerCase()) || ''

function titleCase(str) {
	let splitStr = str.toLowerCase().split(' ')
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
	}
	return splitStr.join(' ')
}

module.exports = {formatDateToTimestamp, formatToLocale, capitalize, titleCase, formatPhoneNumber}
