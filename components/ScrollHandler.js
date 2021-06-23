import { getScrollElement } from './helpers/getScrollElement'

export default class ScrollHandler {
  _scrollElement = null
  _layoutHandler = null
  _lastScroll = null

  get scrollElement() {
    return this._scrollElement
  }

  get scroll() {
    return this._lastScroll
  }

  set scroll(value) {
    this._lastScroll = value
    this.scrollElement.scrollTop = value
  }

  setLastScroll(value) {
    this._lastScroll = value
  }

  getScrollPosition() {
    return this.scrollElement.scrollTop
  }

  constructor({ layoutHandler, scrollElement }) {
    this._scrollElement = getScrollElement(scrollElement)
    this._layoutHandler = layoutHandler
  }
}
