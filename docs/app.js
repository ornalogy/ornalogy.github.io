const scripts = document.getElementsByTagName('script')
const script = document.createElement('script')
const scriptSrc = scripts[scripts.length - 1].src
const newScript = scriptSrc
  .replace('/app.js?s=', '/lib/app.js?s=')
  .replace('/app.js?m=', '/lib/app.js?m=')

if (window.__debug_load_ornalogy) {
  console.log('scriptSrc:', scriptSrc)
  console.log('newScript:', newScript)
}

script.type = 'module'
script.src = newScript
scripts[scripts.length - 1].remove()
document.head.append(script)
