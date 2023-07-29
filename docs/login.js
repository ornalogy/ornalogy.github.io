const appHost = window.location.hostname.endsWith('localhost')
  ? 'http://app.ornalogy.localhost:8080'
  : 'https://app.ornalogy.ru'
const apiHost = `${appHost}/api/`


async function checkLogin() {
  const token = window.location.pathname === '/login/' ? new URLSearchParams(window.location.search).get('token') : null
  const res = await fetch(apiHost + 'check-login', {
    method: 'POST',
    credentials: 'include',
    body: token ? JSON.stringify({ token }) : undefined
  })
  const data = await res.json()

  if (token && data.login) { // @ts-ignore
    window.location = '/'
  }
}


checkLogin()
