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
function onChangeSettingElm(element) {
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

  if (typeof value === 'undefined') {
    delete settings[name]
  } else {
    settings[name] = value
  }
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
    settingElm.addEventListener('change', () => onChangeSettingElm(settingElm))
  }
}


/**
 * @param {{[name:string]:any}} inputSettings
 */
function applySettings(inputSettings) {
  if (Object.keys(inputSettings).length) {
    for (const name in settings) {
      if (!(name in inputSettings)) {
        updateSetting(name)
      }
    }
    for (const [name, value] of Object.entries(inputSettings)) {
      updateSetting(name, value)
    }
  }
}


/**
 * @param {string} name
 * @param {any} [value]
 */
function updateSetting(name, value) {
  if (settings[name] !== value) updateElements(name, value)
}


/**
 * @param {string} name
 * @param {any} defaults
 * @returns {any}
 */
function getSetting(name, defaults) {
  return name in settings ? settings[name] : defaults
}


/**
 * @param {(settings:{[name:string]:any})=>void} fn
 * @param {{withDelay?:boolean, once?:boolean}} [opts]
 */
function onChangeSettings(fn, opts = {}) {
  if (opts.withDelay) {
    changeSettingsWithDelayFN.add(fn)
  } else {
    changeSettingsFN.add(fn)
  }
}


/**
 * @param {string} name
 * @param {()=>any} fn
 */
function onFirstActivateSetting(name, fn) {
  if (settings[name]) {
    fn()
  } else {
    const activate = settings => {
      if (settings[name]) {
        changeSettingsFN.delete(activate)
        fn()
      }
    }

    changeSettingsFN.add(activate)
  }
}


export { registerSettingElements, applySettings, updateSetting, getSetting, onChangeSettings, onFirstActivateSetting }
