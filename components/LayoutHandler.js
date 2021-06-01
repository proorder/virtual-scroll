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

  computeLayoutSize({ scopesCount, displayCollectionLength }) {
    // this.layoutSize[scope] = this.getElementSize()
    if (this.firstCallOccurred) {
      return
    }

    this.calculateElementsOnScreen(displayCollectionLength)

    this.firstCallOccurred = true
    return (
      scopesCount *
      1.5 * // Approximately how many times will the content stretch after filling with data
      this.getElementSize()
    )
  }

  getElementSize() {
    return (
      this._layoutElement.offsetHeight || this._layoutElement.innerHeight || 0
    )
  }

  initMutationObserver({ scopesCount, displayCollectionLength }) {
    return new Promise((resolve) => {
      this.mutationObserver = new MutationObserver(() => {
        if (!this._layoutElement.offsetHeight) {
          return
        }
        const layoutSize = this.computeLayoutSize({
          scopesCount,
          displayCollectionLength,
        })
        if (layoutSize) {
          this.mutationObserver.disconnect()
          resolve({
            layoutSize,
            displayedElementsCount: this._countOfDisplayedElementsOnPage,
          })
        }
      })
      this.mutationObserver.observe(this._layoutElement, {
        childList: true,
      })
    })
  }

  calculateElementsOnScreen(displayCollectionLength) {
    const elementSizeCoeff = 0.8
    const elementSize = this.getElementSize() * elementSizeCoeff
    this._countOfDisplayedElementsOnPage = Math.ceil(
      (this.getParentContainerSize() / elementSize) * displayCollectionLength
    )
  }

  getDisplayCollectionLength({ min, total }) {
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
