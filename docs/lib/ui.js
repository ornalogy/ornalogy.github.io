import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { registerSettingElements } from './settings.js'

const uiHost = 'https://ornalogy.ru'

if (!document.getElementById('ornalogy.ru/lib/ui.css')) {
  oom(document.head, oom.link({ rel: 'stylesheet', href: `${uiHost}/lib/ui.css` }))
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
 * @typedef FooterButtons
 * @property {()=>void} [back]
 */
/**
 * @param {import('@notml/core').OOM} section
 * @param {FooterButtons} [buttons]
 */
function showSections(section, buttons = {}) {
  const footer = oom.div({ class: 'ornalogy__main__footer' })
  const main = oom.div({ class: 'ornalogy ornalogy__main' }, footer)

  if (buttons.back) {
    footer(oom.div({
      class: 'ornalogy__main__footer__button back',
      onclick: () => setTimeout(buttons.back, 200)
    }))
  }
  footer(oom.div({
    class: 'ornalogy__main__footer__button close',
    onclick: () => setTimeout(hideSections, 200)
  }))
  if (buttons.back) {
    footer(oom.div({ class: 'ornalogy__main__footer__space' }))
  }

  hideSections()
  main(section)
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
 * @property {string} [checkboxOption]
 * @property {()=>void} [configButton]
 * @property {import('@notml/core').OOM} [section]
 */
/**
 * @param {MainMenuItem[]} mainMenu
 */
function registerMainMenu(mainMenu) {
  for (const item of mainMenu) {
    const itemElm = oom.div({ class: 'ornalogy__mainmenu__item' })

    if (item.type === 'group') {
      menu(menuGroups[item.name] = oom.div({ class: 'ornalogy__mainmenu__group' }, itemElm))

      if (item.checkboxOption) {
        itemElm(oom.label({ class: 'ornalogy__mainmenu__title' },
          oom.input({ setting: item.checkboxOption, type: 'checkbox' }),
          item.name))
      } else {
        itemElm(oom.div({ class: 'ornalogy__mainmenu__title' }, item.name))
      }

      if (item.configButton) {
        itemElm(oom.div({ class: 'ornalogy__mainmenu__config', onclick: item.configButton }))
      }
    } else {
      if (item.checkboxOption) {
        itemElm(oom.input({ setting: item.checkboxOption, type: 'checkbox' }))
      } else {
        itemElm(oom.div({ class: 'ornalogy__mainmenu__item__space' }))
      }

      itemElm(oom.button(item.name, {
        onclick: () => {
          if (item.section) showSections(item.section, { back: showMainMenu })
        }
      }))

      if (item.section) registerSettingElements(item.section)

      if (item.group in menuGroups) {
        menuGroups[item.group](itemElm)
      } else {
        menu(itemElm)
      }
    }
  }
  registerSettingElements(menu)
}


function showMainMenu() {
  showSections(oom.div({ class: 'ornalogy__section' }, menu))
}


export { showPopup, showError, safely, showSections, registerMainMenu, showMainMenu }
export * from './settings.js'
