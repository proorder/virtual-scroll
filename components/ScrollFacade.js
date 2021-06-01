export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

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

    this.displayCollectionLength = this._layoutHandler.getDisplayCollectionLength(
      { min: minDisplayCollection }
    )

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
}
