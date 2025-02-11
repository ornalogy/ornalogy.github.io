const appHost = 'https://app.ornalogy.ru'
const apiHost = `${appHost}/api/`


/**
 * @param {string} name
 * @param {object} [params]
 * @returns {Promise<object>}
 */
async function apiFetch(name, params = {}) {
  const apiPath = apiHost + name
  const bodyParams = JSON.stringify(params)

  if (window.__debug_load_ornalogy) {
    console.log('apiPath:', apiPath)
    console.log('bodyParams:', bodyParams)
  }

  const res = await fetch(apiPath, {
    method: 'POST',
    credentials: 'include',
    body: bodyParams
  })

  if (res.status === 200) {
    const data = await res.json()

    return data
  }

  const data = {
    status: res.status,
    statusText: res.statusText,
    message: await res.text()
  }

  throw Error(`${data.status} ${data.statusText}\n${data.statusText === data.message ? '' : data.message}`.trim())
}


export {
  appHost,
  apiFetch
}
