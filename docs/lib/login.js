import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { showPopup } from './ui.js'


/**
 * @param {string} token
 */
async function showLoginForm(token) {
  const botName = window.location.hostname.endsWith('localhost') ? 'ornaculum_dev_bot' : 'ornaculum_bot'

  await showPopup(oom.div({}, oom
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
    })).p()
    .div('ВАЖНО! Не кому не сообщайте свой код доступа')
  ), { title: 'Авторизация', actions: ['continue'] })
}


export { showLoginForm }
