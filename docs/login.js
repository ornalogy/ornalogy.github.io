const appHost = window.location.hostname.endsWith('localhost')
  ? `http://app.ornalogy.localhost:${window.location.port}`
  : 'https://app.ornalogy.ru'
const apiHost = `${appHost}/api/`

fetch(apiHost + 'check-login', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ m: 'test' })
})
