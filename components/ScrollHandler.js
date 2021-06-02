import { getScrollElement } from './helpers/getScrollElement'

export default class ScrollHandler {
  _scrollElement = null
  _layoutHandler = null

  lastScroll = null

  constructor({ scrollElement, layoutHandler }) {
    this._scrollElement = getScrollElement(scrollElement)
    this._layoutHandler = layoutHandler
  }

  saveScroll() {
    this.lastScroll = this._scrollElement.scrollTop
  }

  getScrollPosition() {
    return this._scrollElement.scrollTop
  }

  getScrollDiff() {
    return this._scrollElement.scrollTop - this.lastScroll
  }

  handleScroll(event) {}
}
