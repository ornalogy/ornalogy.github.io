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
  const method = window.__debug_load_ornalogy ? xmlHttpFetch : fetch

  if (window.__debug_load_ornalogy) {
    console.log('apiPath:', apiPath)
    console.log('bodyParams:', bodyParams)
  }

  const res = await method(apiPath, {
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


/**
 * @param {string} url
 * @param {{method:string,credentials:'include',body:string}} props
 * @returns {Promise<object>}
 */
function xmlHttpFetch(url, props) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open(props.method, url, true)
    xhr.withCredentials = props.credentials === 'include'
    xhr.setRequestHeader('accept', 'application/json')
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
    xhr.send(props.body)

    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject(new Error(`Error [${xhr.status}]: ${xhr.statusText}`))
      } else {
        resolve({
          status: 200,
          json: () => JSON.parse(xhr.responseText)
        })
      }
    }

    xhr.onerror = () => {
      reject(new Error('Error Status: ' + xhr.status))
    }
  })
}


export {
  appHost,
  apiFetch
}
