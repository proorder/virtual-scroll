export const CHANGE_PAGE = 'CHANGE_PAGE'
export const SCROLL_OVER_TOP_LIMIT = 'SCROLL_OVER_TOP_LIMIT'
export const SCROLL_OVER_BOTTOM_LIMIT = 'SCROLL_OVER_BOTTOM_LIMIT'
export const SCROLL_ON_TOP_LIMIT = 'SCROLL_ON_TOP_LIMIT'
export const SCROLL_ON_BOTTOM_LIMIT = 'SCROLL_ON_BOTTOM_LIMIT'
export const SCROLL_CHANGE_DIRECTION_TO_TOP = 'SCROLL_CHANGE_DIRECTION_TO_TOP'
export const SCROLL_CHANGE_DIRECTION_TO_BOTTOM =
  'SCROLL_CHANGE_DIRECTION_TO_BOTTOM'

export default class PageInterface {
  _eventsList = {
    [CHANGE_PAGE]: [],
    [SCROLL_ON_TOP_LIMIT]: [],
    [SCROLL_ON_BOTTOM_LIMIT]: [],
    [SCROLL_OVER_TOP_LIMIT]: [],
    [SCROLL_OVER_BOTTOM_LIMIT]: [],
  }

  _scrollElement = null

  _deltaOffset = 300
  deltaDelay = 0
  scrollDirection = null
  detectedRects = { scroll: null, groups: [] }
  scrollBeforeCollectionChange = null

  selector = null

  deltaY = 0
  wheelBusy = false
  scrollEventStackBusy = false
  isHorizontalScroll = false
  isInverted = false
  isInitialized = false
  getPage = () => 1
  getHistory = () => []
  getPreviousPage = () => null
  getDisplayCollection = () => []

  onMouseWheelBinded = null

  firstCollectionElementPosition = null

  get history() {
    return this.getHistory()
  }

  get scrollElement() {
    return this._scrollElement
  }

  set scrollElement(value) {
    this._scrollElement = value
  }

  get page() {
    return this.getPage()
  }

  /**
   * @param getHistory {Function}
   * @param getPreviousPage {Function}
   * @param getDisplayCollection {Function}
   * @param getLastPage {Function}
   * @param horizontalScroll {boolean=}
   * @param inverted {boolean=}
   */
  constructor({
    getHistory,
    getPreviousPage,
    getDisplayCollection,
    horizontalScroll,
    inverted,
  }) {
    this.getHistory = getHistory
    this.getPreviousPage = getPreviousPage
    this.getDisplayCollection = getDisplayCollection

    this.isHorizontalScroll = Boolean(horizontalScroll)
    this.isInverted = Boolean(inverted)
  }

  registerObject = {
    on: function (eventName, handler) {
      this.registerEventHandler(eventName, handler)
      return this.registerObject
    }.bind(this),
  }

  on = this.registerObject.on

  /**
   * Initialization scroll behavior
   *
   * @param getPage {Function}
   * @returns {{on: *}}
   */
  init({ getPage }) {
    this.isInitialized = true

    this.getPage = getPage

    this.onMouseWheelBinded = this.onMouseWheel.bind(this)

    this.scrollElement = this.getScrollElement()

    this.detectElementsPositions(this.getDisplayCollection())

    this.scrollElement.addEventListener('wheel', this.onMouseWheelBinded, {
      passive: true,
    })

    return this.registerObject
  }

  destroy() {
    if (this.onMouseWheelBinded) {
      this.scrollElement.removeEventListener('wheel', this.onMouseWheelBinded)
    }
  }

  getVisibleGroups(displayCollection) {
    return Array.from(
      displayCollection.reduce(
        (acc, current) => acc.add(current.group),
        new Set()
      )
    ).filter(
      (g) =>
        this.detectElementVisibility(g) || this.detectElementVisibility(g, true)
    )
  }

  setScrollBeforeCollectionChange() {
    if (this.isHorizontalScroll) {
      this.scrollBeforeCollectionChange = this.scrollElement.scrollLeft
    } else {
      this.scrollBeforeCollectionChange = this.scrollElement.scrollTop
    }
  }

  detectElementsPositions(groups) {
    if (!this.scrollElement || !this.detectedRects.groups) {
      return
    }

    let previousScroll, previousOffset, definePreviousBy

    if (this.detectedRects.scroll !== null) {
      definePreviousBy = this.getPreviousPage() > this.page ? 'last' : 'first'
      previousScroll = this.detectedRects.scroll
      previousOffset = this.detectedRects.groups.find(
        (g) => g.group === this.page
      )
      previousOffset =
        (previousOffset && previousOffset[definePreviousBy].offset) || null
    }

    this.detectedRects.scroll = this.isHorizontalScroll
      ? this.scrollElement.scrollLeft
      : this.scrollElement.scrollTop

    this.detectedRects.scrollHeight = this.isHorizontalScroll
      ? this.scrollElement.scrollWidth
      : this.scrollElement.scrollHeight

    this.detectedRects.groups = [
      ...groups.reduce((acc, current) => acc.add(current.group), new Set()),
    ].map((group) => {
      const targetGroup = document.querySelectorAll(
        this.getFirstElementOnPageSelector(group)
      )
      if (targetGroup.length === 0) {
        return null
      }

      const firstElement = targetGroup[0]
      const lastElement = targetGroup[targetGroup.length - 1]
      const firstElementOffset = this.getElementOffset(firstElement)
      const lastElementOffset = this.getElementOffset(lastElement)

      return {
        group,
        first: {
          height: firstElement.offsetHeight,
          offset: firstElementOffset,
        },
        last: {
          height: lastElement.offsetHeight,
          offset: lastElementOffset,
        },
      }
    })

    if (previousOffset) {
      const targetElement = this.detectedRects.groups.find(
        (g) => g.group === this.page
      )
      if (!targetElement) {
        return
      }

      const scrollDelta =
        this.scrollBeforeCollectionChange - this.detectedRects.scroll

      const interval =
        targetElement[definePreviousBy].offset +
        this.detectedRects.scroll -
        (previousOffset + previousScroll)

      if (this.isHorizontalScroll) {
        this.scrollElement.scrollLeft =
          this.scrollElement.scrollLeft + (scrollDelta + interval)
      } else {
        this.scrollElement.scrollTop =
          this.scrollElement.scrollTop + (scrollDelta + interval) + 1
      }
    }
  }

  detectElementVisibility(group, last = false, direction = false) {
    // Логика данного метода верна и проверена
    const scrollDelta =
      (this.isHorizontalScroll
        ? this.scrollElement.scrollLeft
        : this.scrollElement.scrollTop) - this.detectedRects.scroll

    const detectedElements = this.detectedRects.groups.find(
      (g) => g.group === group
    )
    if (!detectedElements) {
      return false
    }

    const by = last ? 'last' : 'first'

    const elementOffset = detectedElements[by].offset - scrollDelta

    return this.elementIsVisible(
      detectedElements[by].height,
      elementOffset,
      direction && by
    )
  }

  detectCurrentPage() {
    if (this.scrollEventStackBusy) {
      return
    }
    this.scrollEventStackBusy = true

    if (this.scrollDirection === 'top' || this.scrollDirection === 'left') {
      this.detectElementVisibility(this.page - 1, true, this.scrollDirection) &&
        this.emitEvent(CHANGE_PAGE, this.page - 1)
    } else if (
      this.scrollDirection === 'bottom' ||
      this.scrollDirection === 'right'
    ) {
      this.detectElementVisibility(
        this.page + 1,
        false,
        this.scrollDirection
      ) && this.emitEvent(CHANGE_PAGE, this.page + 1)
    }
    this.scrollEventStackBusy = false
  }

  /**
   * @param targetElement {HTMLElement}
   * @param elementOffset {Number} getBoundingClientRect()[top|left]
   * @returns {boolean}
   */
  elementIsVisible(elementHeight, elementOffset, by = false) {
    if (!by) {
      return (
        elementOffset + elementHeight > 0 && elementOffset < window.innerHeight
      )
    }
    return by === 'first'
      ? elementOffset < window.innerHeight
      : elementOffset + elementHeight > 0
  }

  onMouseWheel(e) {
    if (this.wheelBusy) {
      return
    }

    if (e.deltaY > 0) {
      this.scrollDirection = 'bottom'
    } else if (e.deltaY < 0) {
      this.scrollDirection = 'top'
    }

    this.detectCurrentPage()
  }

  registerEventHandler(eventName, handler) {
    return (
      this._eventsList[eventName] && this._eventsList[eventName].push(handler)
    )
  }

  emitEvent(eventName, payload = null) {
    return (
      this._eventsList[eventName] &&
      this._eventsList[eventName].forEach((method) => {
        method(payload)
      })
    )
  }

  checkEventHandlerExist(eventName) {
    return Boolean(
      this._eventsList[eventName] && this._eventsList[eventName].length > 0
    )
  }

  getScrollElement() {
    return (
      (this.selector && document.querySelector(this.selector)) || document.body
    )
  }

  /**
   * Used to find the indentation of a page separator
   *
   * @param page
   * @returns {number|null}
   */
  getPageSeparatorOffset(page = this.page) {
    const target = document.querySelector(
      this.getFirstElementOnPageSelector(page)
    )
    return this.getElementOffset(target)
  }

  addIntervalToScroll() {
    const scrollElement = this.scrollElement
    const interval =
      this.getPageSeparatorOffset(this.history[1]) -
      (this.firstCollectionElementPosition || 0)

    if (this.isHorizontalScroll) {
      scrollElement.scrollLeft = scrollElement.scrollLeft + interval
    } else {
      scrollElement.scrollTop = scrollElement.scrollTop + interval
    }
    this.firstCollectionElementPosition = null
    this.wheelBusy = false
  }

  clearWheelBusy() {
    setTimeout(() => {
      this.wheelBusy = false
    }, 1000)
  }

  scrollToPage(page) {
    if (!this.scrollElement) {
      return
    }
    const element = document.querySelector(
      this.getFirstElementOnPageSelector(page)
    )
    if (!element) {
      return
    }

    const previousPage = this.getPreviousPage()
    if (previousPage) {
      if (previousPage > page) {
        if (this.isHorizontalScroll) {
          this.scrollElement.scrollLeft = this.scrollElement.scrollWidth
        } else {
          this.scrollElement.scrollTop = this.scrollElement.scrollHeight
        }
      } else if (this.isHorizontalScroll) {
        this.scrollElement.scrollLeft = 0
      } else {
        this.scrollElement.scrollTop = 0
      }
    }

    const top = element.offsetTop
    this.scrollElement.scrollTo({
      top,
      behavior: 'smooth',
    })
  }

  scrollToStart() {
    if (!this.scrollElement) {
      return
    }
    if (this.isHorizontalScroll) {
      this.scrollElement.scrollTo({
        left: 0,
        behavior: 'smooth',
      })
    } else {
      this.scrollElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  getElementOffset(element) {
    const rect = element && element.getBoundingClientRect()
    return this.isHorizontalScroll ? rect && rect.left : rect && rect.top
  }

  detectScrollAtTheStart(scrollElement) {
    if (this.isHorizontalScroll) {
      return scrollElement.scrollLeft < this.getDeltaOffset()
    }
    return scrollElement.scrollTop < this.getDeltaOffset()
  }

  detectScrollAtTheEnd(scrollElement) {
    if (this.isHorizontalScroll) {
      return (
        scrollElement.scrollWidth -
          scrollElement.offsetWidth -
          this.getDeltaOffset() <
        scrollElement.scrollLeft
      )
    }
    return (
      scrollElement.scrollHeight -
        scrollElement.offsetHeight -
        this.getDeltaOffset() <
      scrollElement.scrollTop
    )
  }

  getDeltaOffset() {
    return this._deltaOffset
  }

  detectScrollOverStartLimit() {
    return this.deltaY < this.deltaDelay
  }

  detectScrollOverEndLimit() {
    return this.deltaY > this.deltaDelay
  }

  deltaYLTEZero() {
    return this.page > 1 && this.deltaY < 0
  }

  /**
   * Abstract method
   * Used to get the querySelector string of the delimiting anchor between pages
   *
   * @param page
   * @return {String}
   */
  getFirstElementOnPageSelector(page) {
    throw new Error(
      'Method getFirstElementOnPageSelector in PaginationScrollHandler class should be overridden.'
    )
  }
}
