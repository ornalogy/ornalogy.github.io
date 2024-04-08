import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { Map, View, Feature } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/+esm'
import { OSM, Vector as VectorSource } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/source.js/+esm'
import { Tile, Vector as VectorLayer } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/layer.js/+esm'
import { fromLonLat } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/proj.js/+esm'
import { Polygon, Point } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/geom.js/+esm'
import { Stroke, Icon, Style } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/style.js/+esm'
import { Control, defaults as defaultControls } from 'https://cdn.jsdelivr.net/npm/ol@9.0.0/control.js/+esm'
import { showError, showSections } from '../lib/ui.js'
import { apiFetch } from '../lib/api.js'
import { showLoginForm } from '../lib/login.js'

/** @type {Map} */
let map = null
/** @type {VectorLayer} */
let markersLayer = null
const spriteHost = 'https://playorna.com/static/'
const markerSprites = {
  dungeon: 'img/shops/dungeon.png',
  fort: 'img/shops/fort.png',
  mystic_cave: 'img/shops/mystic_cave.png',
  beast_den: 'img/shops/beast_den.png',
  dragon_roost: 'img/shops/dragon_roost.png',
  underworld_portal: 'img/shops/underworld_portal.png',
  chaos_portal: 'img/shops/chaos_portal.png',
  battlegrounds: 'img/shops/battlegrounds.png',
  valley_of_gods: 'img/shops/valley_of_gods.png',
  coliseum: 'img/shops/coliseum.png',
  prometheus: 'img/towers/1_3.png',
  themis: 'img/towers/2_3.png',
  oceanus: 'img/towers/3_3.png',
  eos: 'img/towers/4_3.png',
  selene: 'img/towers/5_3.png',
  demeter: 'img/shops/monument_demeter.png',
  ithra: 'img/shops/monument_ithra.png',
  thor: 'img/shops/monument_thor.png',
  vulcan: 'img/shops/monument_vulcan.png'
}
/**
 * @typedef SpriteProps
 * @property {number} width
 * @property {number} height
 */
const spritePropsDefault = { width: 64, height: 64 }
const spriteProps = {
  monument: { width: 68, height: 68 },
  tower: { width: 48, height: 96 }
}


async function checkLogin() {
  const data = await apiFetch('check-login')

  if (data.login) {
    const params = new URLSearchParams(window.location.search)
    const chat = params.get('chat')
    const city = params.get('city')

    if (!chat && !city) return loadMaps()
    if (chat && !city) return loadCities(chat)
    if (city) return loadMarkers(chat, city)
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
    const href = chat ? `?chat=${chat}&city=${city.uuid}` : `?city=${city.uuid}`

    cities(oom.a({ href }, city.nameRU))
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

    if (data.maps.private.length) {
      const item = drawMap(null, {
        title: 'Персональные',
        cities: data.maps.private
      })

      section(item)
    }

    for (const [chat, map] of Object.entries(data.maps.chats)) {
      const item = drawMap(chat, map)

      section(item)
    }

    if (!Object.keys(data.maps.chats).length && !data.maps.private.length) {
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
 * @typedef MapMarker
 * @property {string} uuid
 * @property {string} ornuuid
 * @property {string} week
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} type
 * @property {string} subtype
 * @property {string} label
 */
/**
 * @typedef UserMap
 * @property {string} chat
 * @property {MapCityCoord} city
 * @property {MapMarker[]} markers
 */
/**
 * @param {string} chat
 * @param {string} city
 * @param {string} [week]
 */
async function loadMarkers(chat, city, week) {
  /** @type {{success:boolean} & UserMap} */
  const data = await apiFetch('map-load-markers', { chat, city, week })

  if (!data.success) {
    await showError('Нет доступа к картам!') // @ts-ignore
    location = '/'
  } else {
    document.title = data.city.nameRU + ' — ' + document.title
    if (!map) createMap(data)
    updateMapMarkers(data.markers)
  }
}


/**
 * @typedef ToolBarControlOptions
 * @property {string} chat
 * @property {string} city
 */
class ToolBarControl extends Control {

  static getWeekMonday(date = new Date()) {
    const dt = new Date(date)

    return dt.setUTCDate(dt.getUTCDate() - (dt.getUTCDay() || 7) + 1) && dt.toJSON().slice(0, 10)
  }

  /** @type {string} */
  chat
  /** @type {string} */
  city
  /** @type {string[]} */
  weeks = null
  /** @type {import('@notml/core').OOM<HTMLSelectElement>} */
  weekSelect = null

  /**
   * @param {ToolBarControlOptions} options
   */
  constructor(options) {
    const params = new URLSearchParams(window.location.search)
    const weekSelect = oom.select({
      class: 'ornalogy__map_toolbar_select',
      onmousedown: () => this.loadWeeks(),
      onchange: () => this.changeWeek()
    }, oom
      .option(ToolBarControl.getWeekMonday())
      .option('Загрузка...')
    )
    const element = oom.div({ class: 'ol-control ol-unselectable ornalogy__map_toolbar' }, oom
      .div({ class: 'ornalogy__map_toolbar_row' }, oom
        .button('<', { onclick: () => this.back() })
        .div({ class: 'ol-box ornalogy__map_toolbar_item' }, oom
          .span(options.city)
          .span(' — ')
          .span(options.chat || 'Персональная')
        )
      )
      .div({ class: 'ornalogy__map_toolbar_row' }, oom
        .div({ class: 'ol-box ornalogy__map_toolbar_item' }, oom
          .span('Неделя:'), weekSelect
        )
      )
    ).dom

    super({ element })

    this.chat = params.get('chat')
    this.city = params.get('city')
    this.weekSelect = weekSelect
  }

  async loadWeeks() {
    if (!this.weeks) {
      this.weeks = []

      /** @type {{success:boolean, weeks:string[]}} */
      const data = await apiFetch('map-load-weeks', { chat: this.chat, city: this.city })

      if (data.success) {
        this.weekSelect({ innerHTML: '' })
        for (const week of data.weeks) {
          this.weekSelect(oom.option(week))
        }
      } else {
        this.weekSelect({ innerHTML: '' }, oom.option('Ошибка загрузки!'))
      }
    }
  }

  async changeWeek() {
    const week = this.weekSelect.dom.value

    await loadMarkers(this.chat, this.city, week)
  }

  back() {
    const params = new URLSearchParams(location.search)

    params.delete('city')
    location.search = params.toString()
  }

}


/**
 * @param {UserMap} mapData
 */
function createMap(mapData) {
  const toolBar = new ToolBarControl({ chat: mapData.chat, city: mapData.city.nameRU })
  const controls = defaultControls().extend([toolBar])
  const center = fromLonLat([mapData.city.longitude, mapData.city.latitude])
  const cityBorders = []

  for (const polygonRaw of mapData.city.coordinates) {
    const polygon = polygonRaw.map(({ latitude, longitude }) => fromLonLat([longitude, latitude]))
    const feature = new Feature(new Polygon([polygon]))

    feature.setStyle(new Style({ stroke: new Stroke({ color: 'rgba(255, 0, 0, 0.3)', width: 3 }) }))
    cityBorders.push(feature)
  }

  oom(document.body, oom.div({ id: 'map' }))
  map = new Map({ target: 'map', controls, layers: [new Tile({ source: new OSM() })] })
  map.setView(new View({ center, zoom: 12, maxZoom: 18, minZoom: 10 }))
  map.addLayer(new VectorLayer({ source: new VectorSource({ features: cityBorders }) }))
}


/**
 * @param {MapMarker[]} markers
 */
function updateMapMarkers(markers) {
  const features = []

  if (markersLayer) map.removeLayer(markersLayer)
  for (const { latitude, longitude, type, subtype } of Object.values(markers)) {
    /** @type {SpriteProps} */
    const props = spriteProps[type] || spritePropsDefault
    const sprite = spriteHost + markerSprites[subtype || type]
    const point = new Point(fromLonLat([longitude, latitude]))
    const feature = new Feature({ geometry: point })
    const opacity = type === 'dungeon' && !subtype ? 0.6 : 1
    const style = new Style({ image: new Icon({ opacity, src: sprite, width: props.width, height: props.height }) })

    feature.setStyle(style)
    features.push(feature)
  }
  markersLayer = new VectorLayer({ source: new VectorSource({ features }) })
  map.addLayer(markersLayer)
}


checkLogin()
