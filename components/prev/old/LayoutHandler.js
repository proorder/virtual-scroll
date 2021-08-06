export default class LayoutHandler {
  _offset = null
  _element = null
  _startOffset = null
  _endOffset = null
  _isHorizontal = false

  _roughlyMeasuredSpace = null
  _countOfDisplayedElementsOnPage = null
  _countOfStoragesScreens = 3
  _layoutSize

  /**
   * @param offset Number
   * @param element Element
   * @param ocupiedSpacesRoughlyEqual Boolean
   */
  constructor({ offset, element, occupiedSpacesRoughlyEqual, isHorizontal }) {
    this._offset = offset
    this._element = element
    this._roughlyEqual = occupiedSpacesRoughlyEqual || true
    this._isHorizontal = isHorizontal || false
  }

  computeLayoutSize() {
    return (
      this._countOfDisplayedElementsOnPage *
      this._countOfStoragesScreens *
      3 * // Approximately how many times will the content stretch after filling with data
      this._roughlyMeasuredSpace
    )
  }

  // ----------------------------- //
  //        PUBLIC METHODS         //
  // ----------------------------- //

  prepareLayoutSize(scrollParentContainerSize) {
    // TODO: Требует проверок
    if (this._roughlyEqual) {
      this._countOfDisplayedElementsOnPage = Math.ceil(
        scrollParentContainerSize / this._roughlyMeasuredSpace
      )
      this._layoutSize = this.computeLayoutSize()
      return this._layoutSize
    }
  }

  getCountOfPagesOnScreen() {
    return this._countOfDisplayedElementsOnPage
  }

  estimateCollection() {
    this._roughlyMeasuredSpace = this._isHorizontal
      ? this._element.offsetWidth
      : this._element.offsetHeight
  }
}
