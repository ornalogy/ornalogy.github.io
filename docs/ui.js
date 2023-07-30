import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'


oom(document.head, oom.link({
  rel: 'stylesheet',
  href: window.location.hostname.endsWith('localhost')
    ? 'http://ornalogy.localhost:8080/ui.css'
    : 'https://ornalogy.ru/ui.css'
}))


/**
 * @typedef PopupOptions
 * @property {string|import('@notml/core').OOM} [title]
 * @property {Array<'ok'|'cancel'>} [actions=['ok']]
 */
/**
 * @param {string|import('@notml/core').OOM} message
 * @param {PopupOptions} [options]
 * @returns {Promise<'ok'|'cancel'>}
 */
async function showPopup(message, options = {}) {
  const popupContent = oom.div({ class: 'ornalogy__popup__content' }, message)
  const popupActions = oom.div({ class: 'ornalogy__popup__actions' })
  const popup = oom.div({ class: 'ornalogy ornalogy__popup' }, popupContent)
  const actions = options.actions || ['ok']

  if (options.title) {
    popupContent(oom.div({ class: 'ornalogy__popup__title' }, options.title))
  }
  popupContent(oom.div({ class: 'ornalogy__popup__message' }, message))
  if (actions.length) popupContent(popupActions)

  return await new Promise(resolve => {
    for (const action of actions) {
      popupActions(oom.button({
        class: `ornalogy__popup__button ornalogy__popup__button-${action} `,
        onclick: () => { popup.dom.remove(); resolve(action) }
      }, 'OK'))
    }

    oom(document.body, popup)
  })
}


export { showPopup }
