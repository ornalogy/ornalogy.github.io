import { appHost, apiFetch } from './api.js'

// @ts-ignore
const appVersion = window.APP_VERSION
const eStack = new Error('').stack
const appScript = eStack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')
const appModule = eStack.replace(/[\s\S]*app\.js\?m=(.*\.js)[\s\S]*/, '$1')


async function initializeApp() {
  const data = await apiFetch('get-app', { appVersion })

  if (!data.login) {
    const { showLoginForm } = await import('./login.js')

    await showLoginForm(data.token)
    initializeApp()
  } else {
    const { loadApp } = await import(`${appHost}/app/${data.oneTimeToken}/core.js`)

    console.log(data)
    await loadApp({
      appScript: appScript === eStack ? '' : appScript,
      appModule: appModule === eStack ? '' : appModule
    })
  }
}


initializeApp()
