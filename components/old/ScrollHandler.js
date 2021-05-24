export default class ScrollHandler {
  _element = null
  _page = null
  _offset = null
  _isHorizontal = false
  _layoutHandler = null

  constructor(
    { page, offset, element, isHorizontal } /*, LayoutHandlerClass */
  ) {
    if (!element) {
      throw new Error('Scroll element must be defined')
    }
    this._isHorizontal = isHorizontal || false
    this._element = element
    if (page) {
      // if (!LayoutHandlerClass) {
      //   throw new Error(
      //     'If you want to manage pages, you must define a control class'
      //   )
      // }
      // Логика связанная с подготовкой лэйаута контейнера
      this._page = page
      this._offset = offset || 0
    }
  }

  // ----------------------------- //
  //        PUBLIC METHODS         //
  // ----------------------------- //

  handleScroll() {
    console.log('Скроллирую')
  }

  getParentContainerSize() {
    const parentNode = this._element.parentNode
    if (
      ['HTML', 'BODY', undefined, null].includes(
        parentNode && parentNode.tagName
      )
    ) {
      return window[this._isHorizontal ? 'innerWidth' : 'innerHeight']
    }
    return parentNode[this._isHorizontal ? 'offsetWidth' : 'offsetHeight']
  }

  // ----------------------------- //
  //       END PUBLIC METHODS      //
  // ----------------------------- //

  // ----------------------------- //
  //        PRIVATE METHODS        //
  // ----------------------------- //
}
