import { storeToken, deleteToken, getTokenValue, getToken } from '@/lib/token'
import { SESSION_TIMEOUT, SESSION_TIMEOUT_STORAGE_KEY } from '@/config/session'
import { authActions } from '@/store/modules/auth/types'
import store from '@/store'
import { alertsActions } from '@/store/modules/alerts/types'

const SessionTimeout = (function() {
	const events = [
		'mousemove',
		'touchmove',
		'touchstart',
		'touchend',
		'click',
		'keypress',
	]

	let timeout = null

	startListeners()

	function startListeners() {
		// console.info('SessionTimeout.startListeners()')
		events.map(function(event) {
			window.addEventListener(event, resetSessionTimer, false);
		})
		startSessionTimer()
	}

	function resetSessionTimer() {
		// console.info('SessionTimeout.resetSessionTimer()')
		const now = new Date(Date.now()).getTime()
		storeToken(SESSION_TIMEOUT_STORAGE_KEY, now)
		clearTimeout(timeout)
		startSessionTimer()
	}

	function startSessionTimer() {
		// console.info('SessionTimeout.startSessionTimer()')
		timeout = window.setTimeout(checkSessionTimeout, SESSION_TIMEOUT)
	}

	// destroy listeners
	function destroyListeners() {
		// console.info('SessionTimeout.destroyListeners()')
		events.map(function(event) {
			window.removeEventListener(event, resetSessionTimer);
		})
	}

	// check inactivity time
	function checkSessionTimeout() {
		// console.info('SessionTimeout.checkSessionTimeout()')
		const now = new Date(Date.now()).getTime()
		const lastActivity = getToken(SESSION_TIMEOUT_STORAGE_KEY)
		if ((now - lastActivity) < SESSION_TIMEOUT) {
			resetSessionTimer()
			return
		}
		destroyListeners()
		store.dispatch(authActions.LOGOUT)
		store.dispatch(alertsActions.SIMPLE, {
			title: 'Logged Out',
			message: 'You have been logged out due to inactivity.',
			config: {
				timeout: 0,
				closeOnClick: true,
				showProgressBar: false
			}
		})
	}

	return this
})

export {
	SessionTimeout
}
