import { apiFetch } from '../lib/api.js'
import { showLoginForm } from '../lib/login.js'


async function checkLogin() {
  const token = window.location.pathname === '/login/' ? new URLSearchParams(window.location.search).get('token') : null
  const data = await apiFetch('check-login', { token })

  if (data.login) {
    const ret = new URLSearchParams(window.location.search).get('ret') || '/'
    const url = new URL(window.location.origin)

    url.pathname = ret // @ts-ignore
    window.location = url.href
  } else {
    await showLoginForm(data.token)
    checkLogin()
  }
}


checkLogin()
