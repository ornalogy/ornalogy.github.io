const appHost = window.location.hostname.endsWith('localhost')
  ? `http://app.ornalogy.localhost:${window.location.port}`
  : 'https://app.ornalogy.ru'

fetch(appHost, {
  method: 'POST',
  body: JSON.stringify({ m: 'test' })
})
