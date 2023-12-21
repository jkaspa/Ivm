// NOTE :: uh... isnt this a circular dependency?, ApiProvider imports AuthProvider too
import { ApiProvider } from './ApiProvider'
import { HttpClient } from './HttpClient'
import { storeToken, deleteToken, getTokenValue, getToken } from '@/lib/token'
import { AUTH_TOKEN, AUTH_REFRESH_BODY, AUTH_ERROR_IDENTITY, AUTH_STORAGE_CLIENT_ID_NAME } from '@/config/auth'
import { IDENTITY, API } from '@/config/api'
import { isObject } from '@/lib/object'
import { futureDatetimeMilliseconds } from '@/lib/datetime'
import { parameterize } from '@/lib/http'
import { collectionToKeyValue } from '@/lib/collection'
import { filterObjectByKeys } from '@/lib/object'
import { parseBoolean } from '@/lib/boolean'
import {
    AUTH_HEADERS,
    AUTH_BASE_URL,
    AUTH_STORAGE_TOKEN_NAME,
    AUTH_LOGIN_URL,
	AUTH_LOGIN_BODY,
	AUTH_FORGOT_PASSWORD_URL,
} from '@/config/auth'
import { API_BASE_URL } from '@/config/api'

// Create HttpClient
let http = HttpClient({
    baseURL: AUTH_BASE_URL,
    headers: AUTH_HEADERS
})

const AuthProvider = {

	/*
	|--------------------------------------------------------------------------
	| AuthProvider
	|--------------------------------------------------------------------------
	|
	| This Provider handles authenticating users for the application and
	| storing/retrieving Auth Tokens in localStorage.
	|
	*/

	/**
     * Log user and store token.
     *
     * @param string username
     * @param string password
	 * @param string guid
     */
    async login(username, password, guid) {

        try {

			// format data to send
            let payload = parameterize({
                ...AUTH_LOGIN_BODY,
                ...{ username, password, guid }
            })

            // retrieve token information from auth server
            const {
                data: {
                    access_token,
                    expires_in,
                    refresh_token
                }
            } = await http.post(AUTH_LOGIN_URL, payload)

            // store token details on device
			const expires_at = futureDatetimeMilliseconds(expires_in)
            storeToken(AUTH_STORAGE_TOKEN_NAME, {
                access_token,
                refresh_token,
                expires_at
			})

			return Promise.resolve({
				access_token,
				expires_at
			})

        } catch (error) {

			// pass into error handler
			// error handler returns
			// {
			// type => error.response.data.error :: "invalid_grant"
			// desc => error.response.data.error_description :: "Invalid UserName or Password"
			// status => error.response.status :: "400" (Bad Request)
			// error => error (actual error object)
			// }

			let msg = error.message
			if (error.response.data.error == 'invalid_grant') {
				msg = error.response.data.error_description
			}
			return Promise.reject(msg)
        }
    },

	/**
     * Delete token in localStorage.
     *
     * @return void
     */
    async logout() {
		try {
			this.clearClient()
			await deleteToken(AUTH_STORAGE_TOKEN_NAME)

		} catch (error) {
			throw error
		}
	},

	async forgotPassword(username) {
        try {
			const { data } = await http.get(AUTH_FORGOT_PASSWORD_URL, { baseURL: API_BASE_URL, params: { username }})
			return data
			
        } catch (error) {
			throw error
        }
	},

	/**
     * Refresh the access token and update localStorage.
     *
     * @return void
     */
    async refreshToken() {

		try {

			// format data to send
            let payload = parameterize({
				...AUTH_REFRESH_BODY,
				...{
					refresh_token: this.getRefreshToken()
				}
            })

            // retrieve token information from auth server
            const {
                data: {
                    access_token,
                    expires_in,
                    refresh_token
                }
            } = await http.post(AUTH_LOGIN_URL, payload)

			const expires_at = futureDatetimeMilliseconds(expires_in)

            // store token details on device
            await storeToken(AUTH_STORAGE_TOKEN_NAME, {
                access_token,
                refresh_token,
                expires_at
			})

			return Promise.resolve({
				access_token,
				refresh_token,
				expires_at,
			})

        } catch (error) {
			return Promise.reject(error)
		}
    },

	/**
     * Returns Access Token from localStorage.
     *
     * @return string
     */
    getAccessToken() {
		return getTokenValue(AUTH_STORAGE_TOKEN_NAME, AUTH_TOKEN.ACCESS_TOKEN)
    },

	/**
     * Returns Refresh Token from localStorage.
     *
     * @return string
     */
    getRefreshToken() {
		return getTokenValue(AUTH_STORAGE_TOKEN_NAME, AUTH_TOKEN.REFRESH_TOKEN)
    },

	/**
     * Returns Access Token expiration DateTime from localStorage.
     * Luxon DateTime.toISO(). https://moment.github.io/luxon/
     *
     * @return string
     */
    getTokenExpirationDateTime() {
		return getTokenValue(AUTH_STORAGE_TOKEN_NAME, AUTH_TOKEN.EXPIRES_AT)
	},

	/**
     * Returns current Client ID (uses Impersonate if available)
	 * from localStorage.
     *
     * @return string
     */
	setClient(client) {
		if (!client || !isObject(client)) throw '`client` is not an Object'
		return storeToken(AUTH_STORAGE_CLIENT_ID_NAME, client)
	},
    getClient(key = undefined) {
		if (!key) return getToken(AUTH_STORAGE_CLIENT_ID_NAME)
		else return getTokenValue(AUTH_STORAGE_CLIENT_ID_NAME, key)
	},
	clearClient() {
		return deleteToken(AUTH_STORAGE_CLIENT_ID_NAME)
	},

	/**
     * Returns true if the Access Token has expired.
     *
     * @return boolean
     */
	isTokenExpired() {
		return Date.now() >= this.getTokenExpirationDateTime()
	},

	/**
     * Returns the Authenticated User's Identity from the API.
     *
     * @return object
     */
	async getIdentity() {

		try {
			const response = await ApiProvider.get(API.IDENTITY)

			// Convert Collection to Object
			const identityObject = collectionToKeyValue(response.data, 'type', 'value')

			// Return object w/ key/vals we define via array of key names
			const identityObjectFiltered = filterObjectByKeys(identityObject, [
				IDENTITY.CLIENTID,
				IDENTITY.CLIENT_NAME,
				IDENTITY.IS_ENHANCED_CLIENT,
				IDENTITY.IS_CLIENT_APPLICATION_FEATURE_ROLES,
				IDENTITY.MACHINE_ID,
				IDENTITY.USER_ID,
				IDENTITY.USERNAME,
				IDENTITY.USERNAME_PREFERRED,
				IDENTITY.IS_ADMIN,
				IDENTITY.IS_IVM_ADMIN,
				IDENTITY.IS_RESETTING_PASSWORD,
				IDENTITY.PROFILE_TYPE,
				IDENTITY.MACHINE_USER_ID,
				IDENTITY.ROLE,
				IDENTITY.ROLE_ID,
				IDENTITY.EMAIL,
				IDENTITY.FIRST_NAME,
				IDENTITY.MIDDLE_NAME,
				IDENTITY.LAST_NAME,
				IDENTITY.IS_VERIFYING_EMAIL,
				IDENTITY.IS_VERIFYING_EMAIL_CODE_EXPIRED,
				IDENTITY.LAST_SUCCESSFUL_EMAIL_VERIFICATION_DATE,
				IDENTITY.IS_ACTIVE
			])

			const identityObjectCleaned = cleanIdentityValues(identityObjectFiltered)

			return identityObjectCleaned

		} catch (error) {
			throw new Error(AUTH_ERROR_IDENTITY)
		}
	},
}

export {
    AuthProvider
}

function cleanIdentityValues(values) {
	return Object.keys(values).reduce((acc, key) => {
		acc[key] = parseBoolean(values[key])
		return acc
	}, {})
}
