export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  _collectionExtenders = []

  displayCollectionLength = 0
  currentScope = 1
  scopesCount = 1

  constructor({ scrollHandler, collectionHandler, layoutHandler }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
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

    if (this._scrollHandler.getScrollPosition()) {
      startIndex = this._layoutHandler.calculateStartIndex(
        this.displayCollectionLength,
        this._scrollHandler.getScrollPosition()
      )
      this._layoutHandler.setLayoutShift(
        this._scrollHandler.getScrollPosition()
      )
    }
    this._scrollHandler.getScrollPosition()
    this.displayCollectionLength = this._layoutHandler.getDisplayCollectionLength(
      { min: minDisplayCollection }
    )
    // if (!this._scrollHandler.getScrollDiff()) {
    //   this.displayCollectionLength = this._layoutHandler.getDisplayCollectionLength(
    //     { min: minDisplayCollection }
    //   )
    // } else {
    //   this.displayCollectionLength =
    //     this.displayCollectionLength + this._scrollHandler.getScrollDiff()
    // }
    // this._scrollHandler.saveScroll()

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

  handleScroll(event) {
    this._collectionExtenders.forEach((func) => {
      func()
    })
    // this._scrollHandler.handleScroll(event)
  }
}
