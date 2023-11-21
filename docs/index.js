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
], { canBeClosed: false })
showMainMenu()
