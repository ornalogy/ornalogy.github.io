import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { Map, View, Feature } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/+esm'
import { OSM, Vector as VectorSource } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/source.js/+esm'
import { Tile, Vector as VectorLayer } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/layer.js/+esm'
import { fromLonLat } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/proj.js/+esm'
import { Polygon } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/geom.js/+esm'
import { Stroke, Style } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/style.js/+esm'
import { Control, defaults as defaultControls } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/control.js/+esm'
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

    if (!Object.keys(data.maps.chats).length) {
      section(oom.div({ class: 'ornalogy__section' }, oom
        .p(oom
          .span('Нет доступных карт.').br().span('Отправьте боту ')
          .a({ href: 'https://t.me/ornaculum_bot', target: '_blanck' }, '@ornaculum_bot')
          .span(' команду ').code('/maps').span(', и узнайте как работать с картами.'))
      ))
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
 * @typedef MapCityCoord
 * @property {number} osmid
 * @property {string} nameEN
 * @property {string} nameRU
 * @property {number} latitude
 * @property {number} longitude
 * @property {{latitude:number,longitude:number}[][]} coordinates
 */
/**
 * @typedef UserMap
 * @property {string} chat
 * @property {MapCityCoord} city
 */
/**
 * @param {string} chat
 * @param {string} city
 */
async function loadMarkers(chat, city) {
  /** @type {{success:boolean} & UserMap} */
  const data = await apiFetch('map-load-markers', { chat, city })

  if (!data.success) {
    await showError('Нет доступа к картам!') // @ts-ignore
    location = '/'
  } else {
    document.title = data.city.nameRU + ' — ' + document.title

    oom(document.body, oom
      .div({ id: 'map' }))
    createMap(data)

    console.log(data)
  }
}


/**
 * @typedef ToolBarControlOptions
 * @property {string} chat
 * @property {string} city
 */
class ToolBarControl extends Control {

  /**
   * @param {ToolBarControlOptions} options
   */
  constructor(options) {
    const element = oom.div({ class: 'ol-control ol-unselectable ornalogy__map_toolbar' }, oom
      .div({ class: 'ol-box ornalogy__map_toolbar_item' }, oom
        .span(options.city)
        .span(' — ')
        .span(options.chat)
      )
    ).dom

    super({ element })
  }

}


/**
 * @param {UserMap} mapData
 */
function createMap(mapData) {
  const toolBar = new ToolBarControl({ chat: mapData.chat, city: mapData.city.nameRU })
  const controls = defaultControls().extend([toolBar])
  const map = new Map({ target: 'map', controls, layers: [new Tile({ source: new OSM() })] })
  const center = fromLonLat([mapData.city.longitude, mapData.city.latitude])
  const cityBorders = []

  for (const polygonRaw of mapData.city.coordinates) {
    const polygon = polygonRaw.map(({ latitude, longitude }) => fromLonLat([longitude, latitude]))
    const feature = new Feature(new Polygon([polygon]))

    feature.setStyle(new Style({ stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.3)', width: 3 }) }))
    cityBorders.push(feature)
  }

  map.setView(new View({ center, zoom: 12, maxZoom: 18, minZoom: 10 }))
  map.addLayer(new VectorLayer({ source: new VectorSource({ features: cityBorders }) }))
}


checkLogin()
