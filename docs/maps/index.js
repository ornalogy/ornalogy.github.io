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


/**
 * @typedef MapCity
 * @property {string} uuid
 * @property {string} nameEN
 * @property {string} nameRU
 */
/**
 * @typedef MapItem
 * @property {string} title
 * @property {MapCity[]} cities
 */
/**
 * @param {string} chat
 * @param {MapItem} map
 * @returns {import('@notml/core').OOM}
 */
function drawMap(chat, map) {
  const header = oom.div({ class: 'ornalogy__site__header' }, oom.h2(map.title))
  const cities = oom.div({ class: 'ornalogy__section' })
  const item = oom.div(header, cities)

  for (const city of map.cities) {
    cities(oom.a({ href: `?chat=${chat}&city=${city.uuid}` }, city.nameRU))
  }
  if (!map.cities.length) {
    cities('Нет данных')
  }

  return item
}


/**
 * @typedef UserMaps
 * @property {MapCity[]} private
 * @property {{[chat:string]:MapItem}} chats
 */
async function loadMaps() {
  /** @type {{success:boolean,maps:UserMaps}} */
  const data = await apiFetch('load-maps')

  if (!data.success) {
    await showError('Нет доступа к картам!') // @ts-ignore
    location = '/'
  } else {
    const section = oom.div()

    for (const [chat, map] of Object.entries(data.maps.chats)) {
      const item = drawMap(chat, map)

      section(item)
    }

    showSections(section, {
      canBeClosed: false, // @ts-ignore
      back: () => { location = '/' }
    })
  }
}


/**
 * @param {string} chat
 */
async function loadCities(chat) {
  /** @type {{success:boolean} & MapItem} */
  const data = await apiFetch('map-load-cities', { chat })

  if (!data.success) {
    await showError('Нет доступа к карте!') // @ts-ignore
    location = '/'
  } else {
    showSections(drawMap(chat, data), {
      canBeClosed: false,
      back: () => { location.search = '/maps/' }
    })
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
