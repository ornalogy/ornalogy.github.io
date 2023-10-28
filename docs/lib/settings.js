/** @type {{[name:string]:any}} */
const settings = {}
/** @type {{[name:string]:Set<HTMLElement>}} */
const elements = {}


/**
 * @param {HTMLElement} element
 * @returns {any}
 */
function getSettingValue(element) {
  let settingValue

  switch (element.tagName) {
    case 'INPUT': {
      /** @type {HTMLInputElement} */// @ts-ignore
      const input = element

      switch (input.type) {
        case 'checkbox':
          settingValue = input.checked
          break
        case 'number':
          settingValue = Number(input.value)
          break
      }
      break
    }
    case 'SELECT': {
      /** @type {HTMLSelectElement} */// @ts-ignore
      const select = element

      settingValue = select.value
      break
    }
  }

  return settingValue
}


/**
 * @param {HTMLElement} element
 * @param {any} value
 */
function setSettingValue(element, value) {
  switch (element.tagName) {
    case 'INPUT': {
      /** @type {HTMLInputElement} */// @ts-ignore
      const input = element

      switch (input.type) {
        case 'checkbox':
          input.checked = value
          break
        case 'number':
          input.value = value
          break
      }
      break
    }
    case 'SELECT': {
      /** @type {HTMLSelectElement} */// @ts-ignore
      const select = element

      select.value = value
      break
    }
  }
}


/**
 * @param {HTMLElement} element
 */
function onChangeSetting(element) {
  const name = element.getAttribute('setting')
  const value = getSettingValue(element)
  const settingElms = elements[name] || []

  for (const settingElm of settingElms) {
    if (settingElm !== element) {
      setSettingValue(settingElm, value)
    }
  }
}


/**
 * @param {import('@notml/core').OOM<HTMLDivElement>} elm
 */
function registerSettingElements(elm) {
  /** @type {Array<HTMLDivElement>} */
  const settingElms = Array.from(elm.dom.querySelectorAll('[setting]'))

  for (const settingElm of settingElms) {
    const name = settingElm.getAttribute('setting')
    let value

    if (name in settings) {
      value = settings[name]
      setSettingValue(settingElm, value)
    } else {
      value = getSettingValue(settingElm)
      settings[name] = value
    }

    if (!(name in elements)) elements[name] = new Set()
    elements[name].add(settingElm)
    settingElm.addEventListener('change', () => onChangeSetting(settingElm))
  }
}


export { registerSettingElements }
