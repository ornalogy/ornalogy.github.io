import { apiFetch } from '../lib/api.js'

async function checkLogin() {
  const token = window.location.pathname === '/login/' ? new URLSearchParams(window.location.search).get('token') : null
  const data = await apiFetch('check-login', { token })

  if (token && data.login) { // @ts-ignore
    window.location = '/'
  }
}


checkLogin()
