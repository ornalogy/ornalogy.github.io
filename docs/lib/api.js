const appHost = window.location.hostname.endsWith('localhost')
  ? 'http://app.ornalogy.localhost:8080'
  : 'https://app.ornalogy.ru'
const apiHost = `${appHost}/api/`


/**
 * @param {string} name
 * @param {object} [params]
 * @returns {Promise<object>}
 */
async function apiFetch(name, params = {}) {
  const res = await fetch(apiHost + name, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(params)
  })
  const data = await res.json()

  return data
}


export {
  apiFetch
}
