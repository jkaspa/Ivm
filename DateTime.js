// https://github.com/knowledgecode/date-and-time
// https://bundlephobia.com/result?p=date-and-time
import date from 'date-and-time'
import 'date-and-time/plugin/meridiem'
import { isDate } from '@/lib/datetime'
import { parseISO, format } from 'date-fns'
date.plugin('meridiem')

// DOC :: this could be affected by user settings stored in localStorage
const DATETIME_FORMAT_OUTPUT = 'YYYY-MM-DD @ hh:mmaa'
const DATETIMEHOUR_FORMAT_OUTPUT = 'MMM dd, yyyy hh:mmaa'
const DATE_FORMAT_OUTPUT = 'YYYY-MM-DD'
const DATE_READ_FORMAT_OUTPUT = 'MMM DD, YYYY'

const DateTime = {

	isDate,

    parse: datetime => {
        if (!datetime) return ''
        return date.format(datetime, DATETIME_FORMAT_OUTPUT)
	},

	formatJsDateToDate: jsDate => {
		let date = new Date(jsDate)
		let day = date.getDate()
		let monthIndex = date.getMonth()+1
		let year = date.getFullYear()
		return `${year}-${monthIndex}-${day}`
	},

	parseAndFormat: datetime => {
		if (!datetime) return ''
		let newDate = new Date(datetime)
		return date.format(newDate, DATETIME_FORMAT_OUTPUT)
	},

	parseAndFormatDate: datetime => {
		if (!datetime) return ''
		let newDate = date.parse(datetime, 'YYYY-MM-DDThh:mm:ss.SSS')
		return date.format(newDate, DATE_FORMAT_OUTPUT)
	},

	parseAndFormatDateReadable: datetime => {
		if (!datetime) return ''
		let newDate = date.parse(datetime, 'YYYY-MM-DDThh:mm:ss')
		return date.format(newDate, DATE_READ_FORMAT_OUTPUT)
	},

	parseAndFormatDateTimeReadable: datetime => {
		if (!datetime) return ''
		let newDate = date.parse(datetime, 'YYYY-MM-DDThh:mm:ss')
		return date.format(newDate, DATETIME_FORMAT_OUTPUT)
	},

	parseISOAndFormatDateTimeReadable: datetime => {
		if (!datetime) return ''
		let newDate = parseISO(datetime)
		return format(newDate, DATETIMEHOUR_FORMAT_OUTPUT)
	}

    // TODO :: functions for UI needs below
    // store preferred datetime format
        // store preferred date format
        // store preferred time format
        // store preferred timezone format
    // temp load preference
}

export {
	DateTime,
	DATETIME_FORMAT_OUTPUT,
	DATE_FORMAT_OUTPUT,
	DATE_READ_FORMAT_OUTPUT,
}
