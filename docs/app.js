const scripts = document.getElementsByTagName('script')
const script = document.createElement('script')

script.type = 'module'
script.src = scripts[scripts.length - 1].src
  .replace('/app.js?s=', '/lib/app.js?s=')
  .replace('/app.js?m=', '/lib/app.js?m=')
scripts[scripts.length - 1].remove()
document.head.append(script)
