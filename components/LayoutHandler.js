export default class LayoutHandler {
  _scrollElement = null
  _layoutElement = null

  _countOfDisplayedElementsOnPage = null

  firstCallOccurred = false
  _layoutShifter = null
  layoutSize = null
  oneElementSize = null

  _setLayoutSize = (layoutSize) => {}

  constructor({ layoutElement, scrollElement, layoutShifter, setLayoutSize }) {
    this._scrollElement = scrollElement
    this._layoutElement = layoutElement
    this._layoutShifter = layoutShifter
    this._setLayoutSize = setLayoutSize
  }

  computeLayoutSize({ total, displayCollectionLength }) {
    if (this.firstCallOccurred) {
      return
    }

    this.firstCallOccurred = true
    return (
      Math.ceil(total / displayCollectionLength) *
      1.5 * // Approximately how many times will the content stretch after filling with data
      this.getElementSize()
    )
  }

  computeOneElementSize(displayCollectionLength, grid) {
    if (!grid) {
      return Math.ceil(this.getElementSize() / displayCollectionLength)
    }
    this.oneElementSize = Math.ceil(
      this.getElementSize() / Math.ceil(displayCollectionLength / grid)
    )
    return this.oneElementSize
  }

  computeOneScreenElementsCount(oneElementSize, grid) {
    this._countOfDisplayedElementsOnPage =
      Math.ceil(
        this.getParentContainerSize() / oneElementSize || this.oneElementSize
      ) * grid
    return this._countOfDisplayedElementsOnPage
  }

  setLayoutSize(layoutSize = this.layoutSize) {
    this._setLayoutSize(layoutSize)
  }

  getElementSize() {
    return (
      this._layoutElement.offsetHeight || this._layoutElement.innerHeight || 0
    )
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

  initMutationObserver({ total, displayCollectionLength }) {
    return new Promise((resolve) => {
      this.mutationObserver = new MutationObserver(() => {
        if (!this._layoutElement.offsetHeight) {
          return
        }
        const layoutSize = this.computeLayoutSize({
          total,
          displayCollectionLength,
        })
        this.handleMutationObserver(layoutSize)
        if (layoutSize) {
          this.mutationObserver.disconnect()
          resolve({
            layoutSize,
            // TODO: Реализовать установку данного свойства
            displayedElementsCount: this._countOfDisplayedElementsOnPage,
          })
        }
      })
      this.mutationObserver.observe(this._layoutElement, {
        childList: true,
      })
    })
  }

  handleMutationObserver(layoutSize) {
    this.layoutSize = layoutSize
  }
}
