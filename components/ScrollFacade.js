export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  constructor({ scrollHandler, collectionHandler, layoutHandler }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
  }

  getDisplayCollection(value = false) {
    if (!value) {
      return this._collectionHandler.getDisplayCollection()
    }

    this._collectionHandler.setCollection(value)

    return {
      displayCollection: this._collectionHandler.getDisplayCollection(),
    }
  }

  computeLayoutSize() {
    this._layoutHandler.computeLayoutSize()
  }
}
