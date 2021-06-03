export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  _collectionExtenders = []

  displayCollectionLength = 0
  currentScope = 1
  scopesCount = 1
  isFirstIteration = true

  _lastDisplayedIndex = null

  _grid = 0

  constructor({ scrollHandler, collectionHandler, layoutHandler, grid }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
    this._grid = grid
  }

  getDisplayCollection({
    collection,
    indexes,
    total,
    minDisplayCollection,
    startIndex,
  }) {
    if (!collection) {
      return this._collectionHandler.getDisplayCollection(
        0,
        minDisplayCollection
      )
    }

    const scrollPosition = this._scrollHandler.getScrollPosition()
    // Если чуть проскролили
    if (scrollPosition) {
      // Посчитать стартовый индекс отталкиваясь от среднего размера одного элемента
      startIndex = this._layoutHandler.calculateStartIndex(
        this.displayCollectionLength,
        scrollPosition
      )
      // Установить отступ равный позиции скролла
      this._layoutHandler.setLayoutShift(scrollPosition)
    }
    // Получить длину коллекции
    this.displayCollectionLength = this._layoutHandler.getDisplayCollectionLength(
      { min: minDisplayCollection }
    )

    // Посчитать сколько всего таких страниц есть
    this.scopesCount = Math.ceil(total / this.displayCollectionLength)

    this._collectionHandler.setCollection(collection)

    return this._collectionHandler.getDisplayCollection(
      startIndex,
      this.displayCollectionLength
    )
  }

  initMutationObserver() {
    return this._layoutHandler.initMutationObserver({
      scopesCount: this.scopesCount,
      displayCollectionLength: this.displayCollectionLength,
    })
  }

  setCollectionExtender(collectionExtender) {
    this._collectionExtenders.push(collectionExtender)
  }

  getStartIndex() {
    return this._layoutHandler.calculateStartIndex(
      this.displayCollectionLength,
      this._scrollHandler.getScrollPosition()
    )
  }

  handleScroll(event) {
    // Получаются дергания
    // if (this._grid && this.getStartIndex() < this._grid) {
    //   return
    // }
    // if (!this._scrollHandler.getScrollPosition()) {
    //   return
    // }
    // this._collectionExtenders.forEach((func) => {
    //   func()
    // })
    // this._scrollHandler.handleScroll(event)
  }
}
