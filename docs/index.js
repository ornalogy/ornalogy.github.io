import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { registerMainMenu, showMainMenu } from './lib/ui.js'

registerMainMenu([
  // {
  //   name: 'Мастерская орнакула'
  // },
  // {
  //   name: 'Монстрология и кодекс'
  // },
  // {
  //   name: 'Сборки экипировки'
  // },
  {
    name: 'Картография',
    url: '/maps/'
  },
  // {
  //   name: 'Башни Олимпии'
  // },
  // {
  //   name: 'Расколотые воспоминания'
  // },
  // {
  //   name: 'Гайды'
  // },
  {
    name: 'Полезные ссылки',
    section: oom
      .div({ class: 'ornalogy__section' }, oom
        .label(oom
          .a('Орна по-русски (t.me/ornaRus)', { href: 'https://t.me/ornaRus', target: '_blanck' })
          .span('Новостной канал по игре Orna GPS RPG')
        )
        .label(oom
          .a('Orna GPS RPG Форум по-русски (t.me/ornaRusForum)', { href: 'https://t.me/ornaRusForum', target: '_blanck' })
          .span('Чат для общения по игре')
        )
        .label(oom
          .a('Orna.Codex (t.me/orna_codexRUS)', { href: 'https://t.me/orna_codexRUS', target: '_blanck' })
          .span('Новостной канал с кодексом на монстров')
        )
        .label(oom
          .a('Orna: Memory Hunts (t.me/ornaMemoryHunts)', { href: 'https://t.me/ornaMemoryHunts', target: '_blanck' })
          .span('Группа энтузиастов по совместному поиску расколотых воспоминаний')
        )
        .label(oom
          .a('Орнариум — сайт про Орну (ornarium.ru)', { href: 'https://ornarium.ru/', target: '_blanck' })
          .span('Сайт с гайдами от сообщества "Орна по-русски"')
        )
        .label(oom
          .a('Orna Guide (orna.guide)', { href: 'https://orna.guide/', target: '_blanck' })
          .span('Гайды по Орна на Английском, оценщик предметов, и пр.')
        )
        .label(oom
          .a('Orna RPG (playorna.com)', { href: 'https://playorna.com/', target: '_blanck' })
          .span('Официальный сайт от разработчиков')
        )
        .label(oom
          .a('Hero of Aethric (t.me/HeroofAethic)', { href: 'https://t.me/HeroofAethic', target: '_blanck' })
          .span('Та же Orna, но без GPS, для тех, то не любит ходить')
        )
      )
  }
], {
  header: oom
    .div({ class: 'ornalogy__site__header' }, oom.h1('Ornalogy'))
    .div({ class: 'ornalogy__site__header' },
      'Орналогия или Орнаонтология — учение о сущем, о бытии орнарианцев, изучающее фундаментальные принципы бытия,' +
      ' его сущности и категории, структуру и закономерности существующее в единстве с теорией познания, логикой и практикой'),
  footer: oom.div(
    { class: 'ornalogy__site__footer' },
    oom.span({ class: 'ornalogy__copyleft' }, 'Ornalogy'),
    oom.a({ target: '_blank', href: 'https://t.me/ornalogy' }, 't.me/ornalogy')
  ),
  checkboxOptions: false,
  canBeClosed: false
})
showMainMenu()
