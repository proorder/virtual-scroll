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
    // Передать в сценарий
    // this.scrollFacade
    //   .initMutationObserver()
    //   .then(({ layoutSize, displayedElementsCount }) => {
    //     if (layoutSize) {
    //       this.setLayoutSize(layoutSize)
    //     }
    //     if (displayedElementsCount && displayedElementsCount > this.min) {
    //       this.fillCollection(collection, startIndex)
    //     }
    //   })
  }

  initScroll() {
    this.bindingHandleScroll = this.handleScroll.bind(this)
    this._scrollHandler.scrollElement.addEventListener(
      'scroll',
      this.bindingHandleScroll
    )
  }

  destroyScroll() {
    this._scrollHandler.scrollElement.removeEventListener(
      'scroll',
      this.bindingHandleScroll
    )
  }

  handleScroll() {
    this.scenarioManager.createEvent('scroll')
  }
}
