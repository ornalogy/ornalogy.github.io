const appHost = 'https://app.ornalogy.ru'
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
  appHost,
  apiFetch
}
