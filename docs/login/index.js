import { apiFetch } from '../lib/api.js'
import { showLoginForm } from '../lib/login.js'


async function checkLogin() {
  const token = window.location.pathname === '/login/' ? new URLSearchParams(window.location.search).get('token') : null
  const data = await apiFetch('check-login', { token })

  if (data.login) { // @ts-ignore
    window.location = '/'
  } else {
    await showLoginForm(data.token)
    checkLogin()
  }
}


checkLogin()
