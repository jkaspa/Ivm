import { saveAs } from 'file-saver';
import { write, utils } from 'xlsx';

export const ExportCSV = (csvData, filename) => {
	const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
	const fileExtension = '.xlsx';
	const worksheet = utils.json_to_sheet(csvData)
	const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] }
	const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: fileType })
	saveAs(data, filename+fileExtension)
}

/**
 * Example Usage

	// in model
	import { ExportCSV } from '@/utils/ExportCSV'
	const customMethods = {
		export: async () => {
			try {
				let response = await ApiProvider.get(`api/${API_NAMESPACE.MACHINE_USER.namespace}`)
				// do something with the data to format it
				ExportCSV(response.machineUsers, `machine-users-${Date.now()}`)
			} catch (error) {
				throw error
			}
		},
	}

	// in component
	MachineUser.export()
		.then(() => {
			this.$store.dispatch(alertsTypes.ERROR, {
				title: 'downloaded file',
				message: ''
			})
		})
		.catch(err => {
			this.$store.dispatch(alertsTypes.ERROR, {
				title: 'export failed',
				message: ''
			})
		})
 */
