import './ui.js'
import { appHost, apiFetch } from './api.js'

// @ts-ignore
const appVersion = window.APP_VERSION
const eStack = new Error('').stack
const appScript = eStack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')
const appModule = eStack.replace(/[\s\S]*app\.js\?m=(.*\.js)[\s\S]*/, '$1')

if (window.__debug_load_ornalogy) {
  console.log('eStack:', eStack)
  console.log('appScript:', appScript)
  console.log('appModule:', appModule)
}


async function initializeApp() {
  const data = await apiFetch('get-app', { appVersion })

  if (!data.login) {
    const { showLoginForm } = await import('./login.js')

    await showLoginForm(data.token)
    initializeApp()
  } else {
    const { loadApp } = await import(`${appHost}/app/${data.oneTimeToken}/app.js`)

    await loadApp({
      appScript: appScript === eStack ? '' : appScript,
      appModule: appModule === eStack ? '' : appModule,
      data
    })
  }
}


initializeApp().catch(reason => {
  if (window.__debug_load_ornalogy) {
    console.error(reason)
  }
})
