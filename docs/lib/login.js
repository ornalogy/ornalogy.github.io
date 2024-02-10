import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { showPopup } from './ui.js'


/**
 * @param {string} token
 */
async function showLoginForm(token) {
  const devbot = window.location.hostname.endsWith('localhost') || window.location.hostname.endsWith('.loca.lt')
  const botName = devbot ? 'ornaculum_dev_bot' : 'ornaculum_bot'

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
    .div('ВАЖНО! Никому не сообщайте свой код и не используйте чужой, иначе злоумышленники могут получить доступ в к вашим данным.')
  ), { title: 'Авторизация', actions: ['continue'] })
}


export { showLoginForm }
