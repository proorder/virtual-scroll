export default class Scenario {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  static PRIORITIES = {
    SUPER_HIGH: 5,
    HIGH: 4,
    NORMAL: 3,
    LOW: 2,
    INDIFFERENCE: 1,
  }

  priority = Scenario.PRIORITIES.INDIFFERENCE

  // Properties
  // Стартовый индекс с которого начинается отображение элементов
  index = 0
  // Минимальное число элементов для тестового отображения. Не должно быть меньше чем grid
  minDisplayedEls = null
  // Число колонок
  grid = null
  // Общее число элементов в коллекции
  collectionLength = null
  // Массив промисов, по результатам выполнения которых возобновляется process
  subscribers = {
    collection: null,
  }

  // Передается из virtual-scroll компонента. Устанавливает коллекцию.
  _setDisplayCollection = ({ displayCollection }) => {}

  // Methods
  // Вычисляет приблизительный размер одного элемента
  computeOneElementSize() {
    return this._layoutHandler.computeOneElementSize(
      this._collectionHandler.lastRequiredCollectionLength,
      this.grid
    )
  }

  // Вычисляет какое приблизительное число элементов может поместиться на одном экране
  computeOneScreenElementsCount(oneElementSize) {
    return this._layoutHandler.computeOneScreenElementsCount(
      oneElementSize,
      this.grid
    )
  }

  // Устанавливает размер полосы прокрутки
  setLayoutSize(layoutSize) {
    this._layoutHandler.setLayoutSize(layoutSize)
    return new Promise((resolve) => {
      this.nextTick().then(resolve)
    })
  }

  // Устанавливает отступ для контейнера элементов
  setOffset() {
    this._scrollHandler.setScroll(
      this._layoutHandler.oneElementSize * this._collectionHandler.index
    )
  }

  // Получает коллекцию из CollectionHandler.
  // Вызывает _setDisplayCollection, тем самым выводит коллекцию на дисплей.
  // Дожидается рендера элементов и вызывает resolve.
  setDisplayCollection(index, amount) {
    const {
      displayCollection,
      viewingIndexes,
    } = this._collectionHandler.getDisplayCollection(index, amount)
    this._setDisplayCollection({ displayCollection, viewingIndexes })
    this.subscribers.collection = {
      promise: null,
      resolve: null,
    }

    this.subscribers.collection.promise = new Promise((resolve) => {
      this.subscribers.collection.resolve = resolve
    })
    return new Promise((resolve) => {
      this.subscribers.collection.promise.then(resolve)
      this._layoutHandler
        .initMutationObserver(this.computeLayoutSizeContext())
        .then(resolve)
    })
  }

  computeLayoutSizeContext() {
    return {
      total: this._collectionHandler.total,
      displayCollectionLength: this._collectionHandler
        .lastRequiredCollectionLength,
    }
  }

  // Возвращает Promise, который вызывает resolve
  // в момент вывода коллекции на экран
  mutationHasOccurred() {}

  // Возвращает Promise, который вызывает resolve
  // в момент отрисовки элементов, перед передачей управления браузеру
  nextTick() {
    return new Promise((resolve) => {
      if (requestAnimationFrame) {
        requestAnimationFrame(resolve)
        return
      }
      setTimeout(resolve, 0)
    })
  }

  processEvent(event, payload) {
    if (!this.subscribers.collection) {
      this.process(payload)
      return
    }
    const resolve = this.subscribers.collection.resolve
    // this.subscribers.collection = null
    resolve()
  }

  constructor({
    scrollHandler,
    collectionHandler,
    layoutHandler,
    setDisplayCollection,
    grid,
  }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler

    this.grid = grid

    this._setDisplayCollection = setDisplayCollection
  }

  // Abstract methods
  // Метод конечный автомат, который определяет,
  // что текущий статус соответствует данному сценарию
  stateMachine() {}

  // Метод в котором описывается процесс сценария
  process() {}
}
