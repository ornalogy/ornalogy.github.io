/** @type {{[name:string]:any}} */
const settings = {}
/** @type {{[name:string]:Set<HTMLElement>}} */
const elements = {}
/** @type {Set<(settings:{[name:string]:any})=>void>} */
const changeSettingsFN = new Set()
/** @type {Set<(settings:{[name:string]:any})=>void>} */
const changeSettingsWithDelayFN = new Set()
let changeSettingsWithDelayTimer

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

  updateElements(name, value, element)
}


/**
 * @param {string} name
 * @param {any} value
 * @param {HTMLElement} [element]
 */
function updateElements(name, value, element) {
  const settingElms = elements[name] || []

  settings[name] = value
  for (const settingElm of settingElms) {
    if (settingElm !== element) {
      setSettingValue(settingElm, value)
    }
  }

  for (const fn of changeSettingsFN) {
    fn(settings)
  }
  if (changeSettingsWithDelayTimer) clearTimeout(changeSettingsWithDelayTimer)
  changeSettingsWithDelayTimer = setTimeout(() => {
    for (const fn of changeSettingsWithDelayFN) {
      fn(settings)
    }
  }, 1000)
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


/**
 * @param {{[name:string]:any}} inputSettings
 */
function applySettings(inputSettings) {
  Object.assign(settings, inputSettings)
}


/**
 * @param {string} name
 * @param {any} value
 */
function updateSetting(name, value) {
  if (settings[name] !== value) updateElements(name, value)
}


/**
 * @param {string} name
 * @returns {any}
 */
function getSetting(name) {
  return settings[name]
}


/**
 *
 * @param {(settings:{[name:string]:any})=>void} fn
 * @param {boolean} [withDelay]
 */
function onChangeSettings(fn, withDelay) {
  if (withDelay) {
    changeSettingsWithDelayFN.add(fn)
  } else {
    changeSettingsFN.add(fn)
  }
}


export { registerSettingElements, applySettings, updateSetting, getSetting, onChangeSettings }
