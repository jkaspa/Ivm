import axios from 'axios'
import httpConfig from '@/config/http'

// TODO :: is this really what I want to be doing? no... no it is not...
const HttpClient = (
	instanceConfig = {},
	requestInterceptorSuccess = undefined,
	requestInterceptorError = undefined,
	responseInterceptorSuccess = undefined,
	responseInterceptorError = undefined,
) => {

    const http = axios.create({
        ...httpConfig,
        ...instanceConfig
	})

	http.interceptors.request.use(
		requestInterceptorSuccess,
		requestInterceptorError
	)

	http.interceptors.response.use(
		responseInterceptorSuccess,
		responseInterceptorError
    )

    return {

        head: (url, config = {}) => {
            return http.head(url, config)
        },

        options: (url, config = {}) => {
            return http.options(url, config)
        },

        delete: (url, config = {}) => {
            return http.delete(url, config)
        },

        get: (url, config = {}) => {
            return http.get(url, config)
        },

        post: (url, data, config = {}) => {
            return http.post(url, data, config)
        },

        put: (url, data, config = {}) => {
            return http.put(url, data, config)
        },

        patch: (url, data, config = {}) => {
            return http.patch(url, data, config)
        },

        request: (config = {}) => {
            return http.request(config)
        },

        // TODO :: register / unregister custom middleware
        // registerMiddleware() { },
        // unregisterMiddleware() { },
    }
}

export {
    HttpClient
}
