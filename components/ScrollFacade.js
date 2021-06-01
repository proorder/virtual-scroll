export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

  currentPage = 1

  constructor({ scrollHandler, collectionHandler, layoutHandler }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
  }

  getDisplayCollection({ collection, page }) {
    if (!collection) {
      return this._collectionHandler.getDisplayCollection()
    }

    this.currentPage = page

    this._collectionHandler.setCollection(collection)

    return {
      displayCollection: this._collectionHandler.getDisplayCollection(),
    }
  }

  computeLayoutSize() {
    const layoutSize = this._layoutHandler.computeLayoutSize({
      page: this.currentPage,
    })
    return layoutSize ? { layoutSize } : {}
  }
}
