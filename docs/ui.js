import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'

const uiHost = 'https://ornalogy.ru'

if (!document.getElementById('ornalogy.ru/ui.css')) {
  oom(document.head, oom.link({ rel: 'stylesheet', href: `${uiHost}/ui.css` }))
}


const popupButtonLabels = {
  ok: 'OK',
  cancel: 'Отменить',
  continue: 'Продолжить'
}

/** @typedef {'ok'|'cancel'|'continue'} PopupAction */
/**
 * @typedef PopupOptions
 * @property {string|import('@notml/core').OOM} [title]
 * @property {Array<PopupAction>} [actions=['ok']]
 */
/**
 * @param {string|import('@notml/core').OOM} message
 * @param {PopupOptions} [options]
 * @returns {Promise<PopupAction>}
 */
async function showPopup(message, options = {}) {
  const popupContent = oom.div({ class: 'ornalogy__popup__content' })
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
      }, popupButtonLabels[action]))
    }

    oom(document.body, popup)
  })
}


/**
 * @param {Error|string} error
 * @param {{title?:string}} [options]
 */
async function showError(error, options = {}) {
  await showPopup(error instanceof Error ? error.stack : error, options)
}


/**
 * @param {((...args:any)=>Promise<void>)|((...args:any)=>void)} fn
 * @param  {...any} args
 * @returns {()=>any}
 */
function safely(fn, ...args) {
  return () => (async () => {
    await fn(...args)
  })().catch(showError)
}


/**
 * @param {import('@notml/core').OOM[]} sections
 */
function showSections(...sections) {
  const main = oom.div({ class: 'ornalogy ornalogy__main' }, oom
    .div({ class: 'ornalogy__main__footer' }, oom
      .div({
        class: 'ornalogy__main__footer__button close',
        onclick: () => setTimeout(hideSections, 200)
      })))

  hideSections()
  main(...sections)
  oom(document.body, main)
}


function hideSections() {
  const main = document.querySelector('.ornalogy__main')

  if (main) main.remove()
}


/** @type {{[x:string]:import('@notml/core').OOM}} */
const menuGroups = {}
const menu = oom.div({ class: 'ornalogy__mainmenu' })

/**
 * @typedef MainMenuItem
 * @property {'group'} [type]
 * @property {string} [group]
 * @property {string} name
 */
/**
 * @param {MainMenuItem[]} mainMenu
 */
function registerMainMenu(mainMenu) {
  for (const item of mainMenu) {
    if (item.type === 'group') {
      menu(menuGroups[item.name] = oom
        .div({ class: 'ornalogy__mainmenu__group' }, oom
          .div({ class: 'ornalogy__mainmenu__title' }, item.name)))
    } else if (item.group in menuGroups) {
      menuGroups[item.group](oom.button(item.name))
    } else {
      menu(oom.button(item.name))
    }
  }
}


function showMainMenu() {
  showSections(oom.div({ class: 'ornalogy__section' }, menu))
}


export { showPopup, showError, safely, registerMainMenu, showSections, showMainMenu }
