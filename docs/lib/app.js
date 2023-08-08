import { appHost, apiFetch } from './api.js'

// @ts-ignore
const appVersion = window.APP_VERSION
const appScript = new Error('').stack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')


async function initializeApp() {
  const data = await apiFetch('get-app', { appVersion })

  if (!data.login) {
    const { showLoginForm } = await import('./login.js')

    await showLoginForm(data.token)
    initializeApp()
  } else {
    const { loadApp } = await import(`${appHost}/app/${data.oneTimeToken}/core.js`)

    console.log(data)
    await loadApp({ appScript })
  }
}


initializeApp()
