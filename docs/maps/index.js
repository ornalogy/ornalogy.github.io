import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { showError, showSections } from '../lib/ui.js'
import { apiFetch } from '../lib/api.js'
import { showLoginForm } from '../lib/login.js'


async function checkLogin() {
  const data = await apiFetch('check-login')

  if (data.login) {
    const params = new URLSearchParams(window.location.search)
    const chat = params.get('chat')
    const city = params.get('city')

    if (!chat && !city) return loadMaps()
    if (chat && !city) return loadCities(chat)
    if (chat && city) return loadMarkers(chat, city)
  } else {
    await showLoginForm(data.token)
    checkLogin()
  }
}


async function loadMaps() {
  /** @type {{success:boolean,}} */
  const data = await apiFetch('load-maps')

  if (!data.success) {
    await showError('Нет доступа к картам!') // @ts-ignore
    location = '/'
  } else {
    console.log(data)
  }
}


/**
 * @typedef MapCity
 * @property {string} uuid
 * @property {string} nameEN
 * @property {string} nameRU
 */
/**
 * @param {string} chat
 */
async function loadCities(chat) {
  /** @type {{success:boolean,title:string,cities:MapCity[]}} */
  const data = await apiFetch('map-load-cities', { chat })

  if (!data.success) {
    await showError('Нет доступа к карте!') // @ts-ignore
    location = '/'
  } else {
    const cities = oom.div({ class: 'ornalogy__section' })
    const section = oom.div({ class: 'ornalogy__site__header' }, oom.h1(data.title), cities)

    for (const city of data.cities) {
      cities(oom.a({ href: `?chat=${chat}&city=${city.uuid}` }, city.nameRU))
    }
    if (!data.cities.length) {
      cities('Нет данных')
    }

    showSections(section, { canBeClosed: false })
  }
}


/**
 * @param {string} chat
 * @param {string} city
 */
async function loadMarkers(chat, city) {
  /** @type {{success:boolean}} */
  const data = await apiFetch('map-load-markers', { chat, city })

  if (!data.success) {
    await showError('Нет доступа к картам!') // @ts-ignore
    location = '/'
  } else {
    console.log(data)
  }
}


checkLogin()
