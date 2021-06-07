import ScenarioManager from './ScenarioManager'

export default class ScrollFacade {
  _scrollHandler = null
  _layoutHandler = null
  _collectionHandler = null
  _grid = 0

  bindingHandleScroll = null

  scenarioManager = new ScenarioManager()

  setDisplayCollection = () => {}

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
  }

  setCollection({ collection, minDisplayCollection, total, index }) {
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

  handleScroll() {}
}
