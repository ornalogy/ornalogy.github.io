import { appHost, apiFetch } from './api.js'

// @ts-ignore
const appVersion = window.APP_VERSION
const appScript = new Error('').stack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')


async function loadApp() {
  const data = await apiFetch('get-app', { appVersion })

  if (!data.login) {
    const { showLoginForm } = await import('./login.js')

    await showLoginForm(data.token)
    loadApp()
  } else {
    const script = await fetch(`${appHost}/app/${data.oneTimeToken}/core.js`)

    console.log(data)
    console.log(await script.json())
  }

  console.log(appScript)
}


loadApp()
