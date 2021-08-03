export default class Scenario {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null
  _scenarioManager = null

  static PRIORITIES = {
    SUPER_HIGH: 5,
    HIGH: 4,
    NORMAL: 3,
    LOW: 2,
    INDIFFERENCE: 1,
  }

  static EVENTS = {
    SCROLL: 'scroll',
  }

  priority = Scenario.PRIORITIES.INDIFFERENCE

  processBusy = false

  get total() {
    return this._collectionHandler.total
  }

  /*
   *
   *  Properties
   *  Стартовый индекс с которого начинается отображение элементов
   *
   */
  index = 0
  /*
   *
   *  Минимальное число элементов для тестового отображения. Не должно быть меньше чем grid
   *
   */
  minDisplayedEls = null
  // Число колонок
  grid = null

  /*
   *  Общее число элементов в коллекции
   */
  get collectionLength() {
    return this._collectionHandler.total
  }

  /*
   *
   *  Массив промисов, по результатам выполнения которых возобновляется process
   *
   */
  subscribers = {
    collection: null,
  }

  set manager(manager) {
    this._scenarioManager = manager
  }

  get manager() {
    return this._scenarioManager
  }

  finishProcess() {
    this.manager.finishProcess(this)
  }

  /*
   *
   *  Передается из virtual-scroll компонента. Устанавливает коллекцию.
   *
   */
  _setDisplayCollection = ({ displayCollection }) => {}

  get lastDisplayedIndex() {
    return this._collectionHandler.lastDisplayedIndex
  }

  get lastCollectionLength() {
    return this._collectionHandler.lastRequiredCollectionLength
  }

  get necessaryCollectionLength() {
    return this._layoutHandler.necessaryCollectionLength
  }

  set necessaryCollectionLength(value) {
    this._layoutHandler.necessaryCollectionLength = value
  }

  /*
   *
   *  Methods
   *  Вычисляет приблизительный размер одного элемента
   *
   */
  computeOneElementSize() {
    return this._layoutHandler.computeOneElementSize(
      this._collectionHandler.lastRequiredCollectionLength,
      this.grid
    )
  }

  get oneElementSize() {
    return this._layoutHandler.oneElementSize
  }

  /*
   *
   *  Вычисляет какое приблизительное число элементов может поместиться на одном экране
   *
   */
  computeOneScreenElementsCount(oneElementSize) {
    return this._layoutHandler.computeOneScreenElementsCount(
      oneElementSize,
      this.grid
    )
  }

  get oneScreenElsCount() {
    return this._layoutHandler._countOfDisplayedElementsOnPage
  }

  setLastScrollPosition(value = false) {
    this._scrollHandler.setLastScrollPosition(
      typeof value === 'boolean' ? this.getScrollPosition() : value
    )
  }

  getLastScrollPosition() {
    return this._scrollHandler.lastScroll
  }

  getScrollPosition() {
    return this._scrollHandler.scroll
  }

  setScrollPosition(value) {
    this._scrollHandler.scroll = value
  }

  getContainerSize() {
    return this._layoutHandler.getElementSize()
  }

  /*
   *
   *  Устанавливает размер полосы прокрутки
   *
   */
  setLayoutSize(layoutSize) {
    this._layoutHandler.layoutSize = layoutSize
    this._layoutHandler.setLayoutSize(layoutSize)
    return new Promise((resolve) => {
      this.nextTick().then(resolve)
    })
  }

  get layoutSize() {
    return this._layoutHandler.layoutSize
  }

  set layoutShift(layoutShift) {
    this._layoutHandler.layoutShift = layoutShift
  }

  get layoutShift() {
    return this._layoutHandler.layoutShift
  }

  /*
   *
   *  Устанавливает отступ для контейнера элементов
   *
   */
  setOffset(fromPoint = 0) {
    let offset
    if (fromPoint && this._scrollHandler.scroll) {
      offset = this._scrollHandler.scroll
    } else {
      offset =
        (this._layoutHandler.oneElementSize * this._collectionHandler.index) /
        this.grid
    }
    this._scrollHandler.scroll = offset
    this.layoutShift = offset + fromPoint
  }

  getIndexByOffset() {
    const els =
      this._scrollHandler.getScrollPosition() /
      this._layoutHandler.oneElementSize
    return Math.floor(els) * this.grid
  }

  getHalfScreenEls(index, oneScreenElsCount) {
    const half = Math.ceil(oneScreenElsCount / 2)
    const delta = index - half - ((index - half) % this.grid)
    return index - delta
  }

  /*
   *
   *  Получает коллекцию из CollectionHandler.
   *  Вызывает _setDisplayCollection, тем самым выводит коллекцию на дисплей.
   *  Дожидается рендера элементов и вызывает resolve.
   *
   */
  setDisplayCollection(index, amount) {
    const {
      displayCollection,
      viewingIndexes,
    } = this._collectionHandler.getDisplayCollection(index, amount)
    this.subscribers.collection = {
      promise: null,
      resolve: null,
    }

    this.subscribers.collection.promise = new Promise((resolve) => {
      this.subscribers.collection.resolve = resolve
    })
    return new Promise((resolve) => {
      this.subscribers.collection.promise.then((eventName) => {
        this.subscribers.collection = null
        if (eventName === 'scroll') {
          return
        }
        resolve()
      })
      this._layoutHandler
        .initMutationObserver(this.computeLayoutSizeContext())
        .then((result) => {
          this.subscribers.collection = null
          resolve(result)
        })
      this._setDisplayCollection({ displayCollection, viewingIndexes })
    })
  }

  async displayCollection(index, length) {
    // TODO: Console
    console.log(
      `Инициализация запроса:${index} in ${this._collectionHandler.total}`,
      length
    )
    this._layoutHandler.lastRequiredCollectionLength = length
    let result
    while (!result) {
      result = await this.setDisplayCollection(index, length)
    }
    return result
  }

  computeLayoutSizeContext() {
    return {
      total: this._collectionHandler.total,
      displayCollectionLength: this._collectionHandler
        .lastRequiredCollectionLength,
      grid: this.grid,
    }
  }

  /*
   *
   *  Возвращает Promise, который вызывает resolve
   *  в момент вывода коллекции на экран
   *
   */
  mutationHasOccurred() {}

  /*
   *
   *  Возвращает Promise, который вызывает resolve
   *  в момент отрисовки элементов, перед передачей управления браузеру
   *
   */
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
      if (this.processBusy) {
        return
      }
      this.process(payload)
      return
    }
    const resolve = this.subscribers.collection.resolve
    this.subscribers.collection = null
    resolve(event)
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

  /*
   *
   *  Abstract methods
   *  Метод конечный автомат, который определяет,
   *  что текущий статус соответствует данному сценарию
   *
   */
  stateMachine() {}

  /*
   *
   *  Метод в котором описывается процесс сценария
   *
   */
  process() {}
}
