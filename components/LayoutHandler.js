export default class LayoutHandler {
  _scrollElement = null
  _layoutElement = null

  _countOfDisplayedElementsOnPage = null
  _countOfStoragesScreens = 3

  mutationObserver = null

  firstCallOccurred = false
  layoutSize = {}

  constructor({ layoutElement, scrollElement }) {
    this._scrollElement = scrollElement
    this._layoutElement = layoutElement
  }

  computeLayoutSize({ scope, scopesCount }) {
    this.layoutSize[scope] = this.getElementSize()
    if (this.firstCallOccurred) {
      return
    }
    // this._countOfDisplayedElementsOnPage = Math.ceil(
    //   this.getParentContainerSize() / this.layoutSize[scope]
    // )
    this.firstCallOccurred = true
    return (
      scopesCount *
      1.5 * // Approximately how many times will the content stretch after filling with data
      this.layoutSize[scope]
    )
  }

  getElementSize() {
    return (
      this._layoutElement.offsetHeight || this._layoutElement.innerHeight || 0
    )
  }

  initMutationObserver({ scope, scopesCount }) {
    return new Promise((resolve) => {
      this.mutationObserver = new MutationObserver(() => {
        if (!this._layoutElement.offsetHeight) {
          return
        }
        const layoutSize = this.computeLayoutSize({ scope, scopesCount })
        if (layoutSize) {
          this.mutationObserver.disconnect()
          resolve({ layoutSize })
        }
      })
      this.mutationObserver.observe(this._layoutElement, {
        childList: true,
      })
    })
  }

  getDisplayCollectionLength({ amountDisplayedElements, min, total }) {
    if (!this.firstCallOccurred) {
      return min
    }
    return this._countOfDisplayedElementsOnPage
  }

  getParentContainerSize() {
    const parentNode = this._scrollElement.parentNode
    if (
      ['HTML', 'BODY', undefined, null].includes(
        parentNode && parentNode.tagName
      )
    ) {
      return window[this._isHorizontal ? 'innerWidth' : 'innerHeight']
    }
    return parentNode[this._isHorizontal ? 'offsetWidth' : 'offsetHeight']
  }
}
