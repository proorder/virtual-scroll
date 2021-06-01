export default class LayoutHandler {
  _scrollElement = null
  _layoutElement = null

  _countOfStoragesScreens = 3

  firstCallOccurred = false
  layoutSize = {}

  constructor({ layoutElement, scrollElement }) {
    this._scrollElement = scrollElement
    this._layoutElement = layoutElement
  }

  computeLayoutSize({ page }) {
    this.layoutSize[page] = this.getElementSize()
    if (this.firstCallOccurred) {
      return
    }
    this._countOfDisplayedElementsOnPage = Math.ceil(
      this.getParentContainerSize() / this.layoutSize[page]
    )
    this.firstCallOccurred = true
    return (
      this._countOfDisplayedElementsOnPage *
      this._countOfStoragesScreens *
      3 * // Approximately how many times will the content stretch after filling with data
      this.layoutSize[page]
    )
  }

  getElementSize() {
    return this._layoutElement.offsetHeight || this._layoutElement.innerHeight
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
