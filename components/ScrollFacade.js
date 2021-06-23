import debounce from 'lodash.debounce'
import ScenarioManager from './ScenarioManager'

export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null
  _grid = 0

  bindingHandleScroll = null

  scenarioManager = null

  setDisplayCollection = () => {}

  get currentCollection() {
    return this._collectionHandler._collection
  }

  constructor({
    scrollHandler,
    collectionHandler,
    layoutHandler,
    setDisplayCollection,
    grid,
  }) {
    this._scrollHandler = scrollHandler
    this._collectionHandler = collectionHandler
    this._layoutHandler = layoutHandler
    this._grid = grid

    this.setDisplayCollection = setDisplayCollection

    this.scenarioManager = new ScenarioManager(
      this.buildContextForScenarioManager()
    )
  }

  buildContextForScenarioManager() {
    return {
      scrollHandler: this._scrollHandler,
      collectionHandler: this._collectionHandler,
      layoutHandler: this._layoutHandler,
      setDisplayCollection: this.setDisplayCollection,
      grid: this._grid,
    }
  }

  setCollection({ collection, minDisplayCollection, total, index }) {
    this._collectionHandler.setContext({ total, index })
    this._collectionHandler.setCollection(collection)
    this.scenarioManager.createEvent('collectionUpdated', {
      collection,
      minDisplayCollection,
      total,
      index,
    })
  }

  initScroll() {
    this.bindingHandleScroll = debounce(this.handleScroll.bind(this), 250)
    const scrollElement =
      this._scrollHandler.scrollElement instanceof HTMLHtmlElement
        ? document
        : this._scrollHandler.scrollElement
    scrollElement.addEventListener('scroll', this.bindingHandleScroll)
  }

  destroyScroll() {
    const scrollElement =
      this._scrollHandler.scrollElement instanceof HTMLHtmlElement
        ? document
        : this._scrollHandler.scrollElement
    scrollElement.removeEventListener('scroll', this.bindingHandleScroll)
  }

  handleScroll() {
    this.scenarioManager.createEvent('scroll')
  }
}
