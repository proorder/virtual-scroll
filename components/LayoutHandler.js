export default class LayoutHandler {
  _scrollElement = null
  _layoutElement = null

  constructor({ layoutElement, scrollElement }) {
    this._scrollElement = scrollElement
    this._layoutElement = layoutElement
    console.log(this._layoutElement)
  }

  computeLayoutSize() {
    console.log(this.getParentContainerSize(), this.getElementSize())
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
