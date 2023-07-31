import { apiFetch } from './lib/api.js'

// @ts-ignore
const appVersion = window.APP_VERSION
const appScript = new Error('').stack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')


async function loadApp() {
  const data = await apiFetch('get-app', { appScript, appVersion })

  if (!data.login) {
    const { showLoginForm } = await import('./lib/login.js')

    await showLoginForm(data.token)
    loadApp()
  } else {
    console.log(data)
  }
}


loadApp()
