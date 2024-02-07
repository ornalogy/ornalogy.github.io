import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { registerMainMenu, showMainMenu } from './lib/ui.js'

registerMainMenu([
  {
    name: 'Мастерская орнакула'
  },
  {
    name: 'Монстрология и кодекс'
  },
  {
    name: 'Сборки экипировки'
  },
  {
    name: 'Картография'
  },
  {
    name: 'Башни Олимпии'
  },
  {
    name: 'Расколотые воспоминания'
  },
  {
    name: 'Гайды'
  },
  {
    name: 'Полезные ссылки'
  }
], {
  header: oom.div({ class: 'ornalogy__site__header' }, oom
    .h1('Ornalogy')
    .p('Орналогия или Орнаонтология — учение о сущем, о бытии орнарианцев, изучающее фундаментальные принципы бытия,' +
      ' его сущности и категории, структуру и закономерности существующее в единстве с теорией познания, логикой и практикой')),
  footer: oom.div(
    { class: 'ornalogy__site__footer' },
    oom.span({ class: 'ornalogy__copyleft' }, 'Ornalogy'),
    oom.a({ target: '_blank', href: 'https://t.me/ornalogy' }, 't.me/ornalogy')
  ),
  checkboxOptions: false,
  canBeClosed: false
})
showMainMenu()
