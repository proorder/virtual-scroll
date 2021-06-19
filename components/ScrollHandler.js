import { getScrollElement } from './helpers/getScrollElement'

export default class ScrollHandler {
  _scrollElement = null
  _layoutHandler = null

  get scrollElement() {
    return this._scrollElement
  }

  constructor({ layoutHandler, scrollElement }) {
    this._scrollElement = getScrollElement(scrollElement)
    this._layoutHandler = layoutHandler
  }

  setScroll(value) {
    this.scrollElement.scrollTop = value
  }
}
