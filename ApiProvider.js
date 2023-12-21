// DOC :: The role of the ApiProvider is to handle the `responseStatus` and return only the relevant data
// NOTE :: uh... isnt this a circular dependency?, AuthProvider imports ApiProvider too
import { AuthProvider } from './AuthProvider'
import { HttpClient } from './HttpClient'
import { isArray } from '@/lib/array'
import { isObject, isObjectEmpty } from '@/lib/object'
import { API_PARAM_CLIENT_ID } from '@/config/api'
import { API_NAMESPACE, API_BASE_URL, API_HEADERS, API_LATEST_VERSION } from '@/config/api'
import axios from 'axios'
import { isString } from '@/lib/string'

const httpConfig = Object.freeze({ baseURL: API_BASE_URL, headers: API_HEADERS })
const hasNoBodyCodes = [204]
const errorCodes = [400, 401, 402, 403, 404, 415, 500]

/**
 * Attaches Auth Headers to all outgoing Api requests.
 *
 * @return object - config for axios request
 */
const attachAuthTokenRequestInterceptorSuccess = (config) => {

	/**
	 * 1. attach the global latest version to outgoing url
	 * 2. import API_NAMESPACE : if url namespace has it's own version #, use that instead
	 * - need to be able to parse url, and identify specific namespace
	 * - once identified (var) lookup namespace and get version #
	 * 3. config specific (modify function from ApiProvider)
	 */

	let urlOutgoingFormat = config.url.split('/')
	const api_names = API_NAMESPACE
	const api_namespace = Object.values(api_names).find(i => urlOutgoingFormat.includes(i.namespace))
	const api_version = api_namespace?.version 


	// Use latest version defined globally
	if (api_version !== API_LATEST_VERSION && api_version !== null)
		urlOutgoingFormat.splice(urlOutgoingFormat.indexOf('api') + 1, 0, api_version)
	else urlOutgoingFormat.splice(urlOutgoingFormat.indexOf('api') + 1, 0, API_LATEST_VERSION)
	
	const joinedUrl = urlOutgoingFormat.join('/')
	config.url = joinedUrl.replace('//', '/')

	// Set Authorization Header
	const accessToken = AuthProvider.getAccessToken()

	config.headers.common['Authorization'] = `Bearer ${accessToken}`

	// Set ClientID if not previously defined
	const clientId = Number(AuthProvider.getClient('id')) || undefined
	
	switch (config.method) {
		case 'put':
			if (!(API_PARAM_CLIENT_ID in config.data) || !config.data[API_PARAM_CLIENT_ID])
				Object.assign(config.data, { [API_PARAM_CLIENT_ID]: clientId })
			break;

		case 'post':
			if (!(API_PARAM_CLIENT_ID in config.data) || !config.data[API_PARAM_CLIENT_ID])
				Object.assign(config.data, { [API_PARAM_CLIENT_ID]: clientId })
			break;

		case 'delete':
			if (!config?.params?.[API_PARAM_CLIENT_ID]) {
				Object.assign(config.params, { [API_PARAM_CLIENT_ID]: clientId })
			}
			break;

		default:
			// TODO :: cleanup below, it works but hurts to look at
			if (config && 'params' in config && config.params) {

				if (API_PARAM_CLIENT_ID in config.params) {
					// client id exists in API request
					if (!config.params[API_PARAM_CLIENT_ID]) {
						// client id exists in API request, but is undefined, setting to clientId
						Object.assign(config.params, { [API_PARAM_CLIENT_ID]: clientId })
					}
				} else {
					// client id is not defined in API request
					Object.assign(config.params, { [API_PARAM_CLIENT_ID]: clientId })
				}
			} else {
				Object.assign(config, { params: { [API_PARAM_CLIENT_ID]: clientId } })
			}

			break;
	}
	return config
}

/**
 * Refreshes Access Token if the Response is 401
 *
 * @return object - config for axios request
 */
const refreshAuthTokenResponseInterceptorError = async (error) => {

	// ignore errors if the request was purposefully cancelled
	if (axios.isCancel(error)) return Promise.reject(error)

	// if not an unauthorized status code, reject
	if (error.response?.status !== 401) return Promise.reject(error)

	// has config and is not a retry request
	if (error.config && !error.config.__isRetryRequest) {
		try {

			// refresh and get a new access token
			const { accessToken } = await AuthProvider.refreshToken()

			// define as retry request
			error.config['__isRetryRequest'] = true

			// set new token
			error.config.headers['Authorization'] = `Bearer ${accessToken}`

			let client = HttpClient(httpConfig)

			// return a NEW promise, if you say `return Promise` without `new` it will
			// fail to refresh the auth token before throwing an error to the UI
			return new Promise((resolve, reject) => client.request(error.config)
				.then(res => {
					return resolve(res)
				}).catch((err) => {
					return reject(err)
				})
			)






			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided
			// TODO :: handle 401 unauthorized with a generic message if one is not provided





		} catch (e) {
			return Promise.reject(e)
		}
	}
}

// Create HttpClient
let http = HttpClient(
	httpConfig,
	attachAuthTokenRequestInterceptorSuccess,
	undefined,
	undefined,
	refreshAuthTokenResponseInterceptorError,
)

const ApiProvider = {

	async download(url, config = {}) {

		try {
			const response = await http.get(url, config)
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	},

	async upload(url, formData, config = {}) {

		try {
			const response = await http.post(url, formData, config)
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	},

	async get(url, params = null, cancelToken = undefined) {

		try {
			const response = await http.get(url, { params, cancelToken })
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	},

	async post(url, data) {
		try {
			const response = await http.post(url, data)
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	},

	async put(url, data) {

		try {
			const response = await http.put(url, data)
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	},

	// DOC :: to send params as part of a delete request be sure to specify a params object within the config
	async delete(url, config) {
		try {
			const response = await http.delete(url, config)
			return handleResponse(response)

		} catch (error) {
			throw handleResponseError(error)
		}
	}
}

export {
	ApiProvider
}

function handleResponse(response) {
	let customResponse = undefined
	let statusMessage = response?.data?.statusMessage?.message || '' // overwrite statusMessage object, we only need the message

	/**
	 * In the early days of the API we would sometimes get a response code of
	 * 200, but the backend devs would return a custom message and status
	 * code on the response. We needed to catch these custom status
	 * codes and throw an error. They have been working to change
	 * this through the API, this may not be needed anymore.
	 */
	// this custom statusCode could be an error code, we should throw an error
	const statusCode = response?.data?.statusMessage?.statusCode || response.status
	if (errorCodes.includes(statusCode)) {
		throw new Error(response.body)
	}

	// handle no body codes
	if (!response.data && hasNoBodyCodes.includes(response.status)) {
		customResponse = {
			data: undefined,
			statusMessage: 'No content found for the selected request'
		}
	}

	if (isArray(response.data)) {
		customResponse = {
			data: [...response.data],
			statusMessage
		}

	} else if (isObject(response.data)) {
		customResponse = {
			...response.data,
			statusMessage
		}

	} else {
		customResponse = response.data
	}

	return customResponse
}


/**
 * Returns an array of strings
 */
function handleResponseError(error) {

	const message = error.response.data

	if (isString(message)) {
		return [message]
	}

	if (isObject(message) && message?.errors) {
		// Example of what the `message` variable may look like.
		// {
		// 	"type":"https://tools.ietf.org/html/rfc7231#section-6.5.1",
		// 	"title":"One or more validation errors occurred.",
		// 	"status":400,
		// 	"traceId":"00-e3aef2cefde50f44973c02705591f531-0220841ec65b5a4f-00",
		// 	"errors":{
		// 	   "Name":[
		// 		  "The Name field is required."
		// 	   ],
		// 	   "Barcode":[
		// 		  "The Barcode field is required."
		// 	   ],
		// 	   "ItemNumber":[
		// 		  "The ItemNumber field is required."
		// 	   ],
		// 	   "ShipPackQuantity":[
		// 		  "ShipPackQuantity missing or invalid."
		// 	   ]
		// 	}
		// }
		return Object.values(message.errors).reduce((acc, array) => ([...acc, ...array]), [])
	}

	return error.response.data
}
