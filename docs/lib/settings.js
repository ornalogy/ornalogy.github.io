/**
 * @param {import('@notml/core').OOM<HTMLDivElement>} elm
 */
function registerSettingElements(elm) {
  const settingElms = elm.dom.querySelectorAll('[setting]')

  console.log(settingElms)
}


export { registerSettingElements }
