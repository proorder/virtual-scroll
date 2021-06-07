export default class Scenario {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  // Properties
  // Стартовый индекс с которого начинается отображение элементов
  index = null
  // Минимальное число элементов для тестового отображения. Не должно быть меньше чем grid
  minDisplayedEls = null
  // Число колонок
  grid = null
  // Общее число элементов в коллекции
  collectionLength = null

  // Methods
  // Вычисляет приблизительный размер одного элемента
  computeOneElementSize() {}

  // Вычисляет какое приблизительное число элементов может поместиться на одном экране
  computeOneScreenElementsCount() {}

  // Устанавливает размер полосы прокрутки
  setLayoutSize() {}

  // Устанавливает отступ для контейнера элементов
  setOffset() {}

  // Устанавливает displayCollection
  setDisplayCollection(index, amount) {}

  // Возвращает Promise, который вызывает resolve
  // в момент вывода коллекции на экран
  mutationHasOccurred() {}

  // Возвращает Promise, который вызывает resolve
  // в момент отрисовки элементов, перед передачей управления браузеру
  nextTick() {}

  constructor({ scrollHandler, collectionHandler, layoutHandler }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
  }

  // Abstract methods
  // Метод конечный автомат, который определяет,
  // что текущий статус соответствует данному сценарию
  stateMachine() {}

  // Метод в котором описывается процесс сценария
  process() {}
}
