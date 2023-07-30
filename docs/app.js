import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { apiFetch } from './lib/api.js'
import { showPopup } from './ui.js'

const appScript = new Error('').stack.replace(/[\s\S]*app\.js\?s=(.*\.js)[\s\S]*/, '$1')


async function loadApp() {
  const data = await apiFetch('get-app', { appScript })

  if (!data.login) {
    showLoginForm(data.token)
  } else {
    console.log(data)
  }
}


/**
 * @param {string} token
 */
function showLoginForm(token) {
  const botName = window.location.hostname.endsWith('localhost') ? 'ornaculum_dev_bot' : 'ornaculum_bot'

  showPopup(oom.div({}, oom
    .div(oom
      .span('Для подтверждения входа отправьте боту ')
      .a({ href: `https://t.me/${botName}`, target: '_blanck' }, `@${botName}`)
      .span(' личное сообщение с кодом доступа:')
    )
    .div(oom.input({
      type: 'text',
      readonly: 'true',
      onclick: 'this.select()',
      value: `/login ${token}`
    }))
    .div('Затем перезапустите приложение')
    .p()
    .div('ВАЖНО! Не кому не сообщайте свой код доступа')
  ), { title: 'Авторизация', actions: [] })
}


loadApp()
