// import {
//   getCurrentScope,
//   calculateScopes,
// } from './helpers/calculateElementsScope'

export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null

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
    start,
  }) {
    if (!collection) {
      return this._collectionHandler.getDisplayCollection(
        0,
        minDisplayCollection
      )
    }

    const displayCollectionLength = this._layoutHandler.getDisplayCollectionLength(
      { min: minDisplayCollection }
    )

    // const { scopes, elementsInScope } = calculateScopes(indexes, total)
    // this.scopesCount = scopes
    // this.currentScope = getCurrentScope(indexes[0], elementsInScope)

    this._collectionHandler.setCollection(collection)

    if (!this._layoutHandler.firstCallOccurred) {
      return this._collectionHandler.getDisplayCollection(
        indexes[0],
        minDisplayCollection
      )
    }
  }

  initMutationObserver() {
    return this._layoutHandler.initMutationObserver({
      scope: this.currentScope,
      scopesCount: this.scopesCount,
    })
  }
}
