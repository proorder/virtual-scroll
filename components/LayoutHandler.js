export default class LayoutHandler {
  _scrollElement = null

  firstCallOccurred = false

  /*
   |
   |  В общем случае, используется
   |  для проверки на необходимое количество мутаций
   |
   */
  collectionMemento = {
    lastMutationRecords: 0, // is length
    previousRequiredCollection: 0, // is length
    lastRequiredCollection: 0, // is length
    // eslint-disable-next-line accessor-pairs
    set addMutationRecords(recordsLength) {
      this.lastMutationRecords += recordsLength
    },
    get deltaRequiredCollections() {
      return this.lastRequiredCollection - this.previousRequiredCollection
    },
    // eslint-disable-next-line accessor-pairs
    set requiredCollection(length) {
      this.previousRequiredCollection = this.lastRequiredCollection
      this.lastRequiredCollection = length
    },
  }

  /*
   |
   |  Используется в Scenario при запросе новой displayCollection
   |
   */
  // eslint-disable-next-line accessor-pairs
  set lastRequiredCollectionLength(length) {
    this.collectionMemento.requiredCollection = length
  }

  /*
   *  Используется в Scenario
   */
  necessaryCollectionLength = null

  /*
   |
   |  Layout Shift Block
   |
   */
  // region layoutShift

  _layoutShift = null

  set layoutShift(shift) {
    this._layoutShift = shift
    this.$setLayoutShift(shift)
  }

  get layoutShift() {
    return this._layoutShift
  }

  $setLayoutShift = (layoutShift) => {}
  // endregion layoutShift

  /*
   |
   |  Layout Size Block
   |
   */
  // region layoutSize

  layoutSize = null
  _lastComputedLayoutSize = null

  _countOfDisplayedElementsOnPage = null

  oneElementSize = null

  layoutElement = {
    _highCtx: this,
    _container: null,
    set container(value) {
      this._container = value
    },
    get container() {
      return this._container
    },
    get size() {
      if (!this.container.childElementCount) {
        return 0
      }
      const childCount = this.container.childElementCount
      const filled =
        this.container.children[childCount - 1].offsetTop +
        this.container.children[childCount - 1].offsetHeight
      return filled - this.container.children[0].offsetTop
    },
  }

  computeLayoutSize({ total, displayCollectionLength, grid }) {
    this.firstCallOccurred = true
    if (grid) {
      displayCollectionLength = Math.ceil(displayCollectionLength / grid) * grid
    }
    return (
      (total / displayCollectionLength) * this.layoutElement.size // Can be multiply on Approximately how many times will the content stretch after filling with data
    )
  }

  computeOneElementSize(displayCollectionLength, grid) {
    if (!grid || grid === 1) {
      return Math.ceil(this.layoutElement.size / displayCollectionLength)
    }
    this.oneElementSize = Math.ceil(
      this.layoutElement.size / Math.ceil(displayCollectionLength / grid)
    )
    return this.oneElementSize
  }

  computeOneScreenElementsCount(oneElementSize, grid) {
    this._countOfDisplayedElementsOnPage =
      Math.ceil(
        this.getParentContainerSize() / oneElementSize || this.oneElementSize
      ) * grid
    return this._countOfDisplayedElementsOnPage
  }

  setLayoutSize(layoutSize = this.layoutSize) {
    this.$setLayoutSize(layoutSize)
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

  $setLayoutSize = (layoutSize) => {}

  // endregion layoutSize

  constructor({ scrollElement, layoutElement, setLayoutShift, setLayoutSize }) {
    this._scrollElement = scrollElement
    this.layoutElement.container = layoutElement
    this.$setLayoutShift = setLayoutShift
    this.$setLayoutSize = setLayoutSize
  }

  initMutationObserver({ total, displayCollectionLength, grid, changes }) {
    return new Promise((resolve) => {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect()
      }
      this.mutationObserver = new MutationObserver((mutationRecords) => {
        mutationRecords = mutationRecords.filter(
          (m) => m.type === 'childList' && m.addedNodes.length
        )
        if (this.checkMutationObserverFalseSignal()) {
          return
        }

        if (this.checkEnoughMutationRecords(mutationRecords, changes)) {
          return
        }

        const layoutSize = this.computeLayoutSize({
          total,
          displayCollectionLength,
          grid,
        })
        this.handleMutationObserver(layoutSize)
        if (layoutSize || this.collectionMemento.lastRequiredCollection === 0) {
          this._lastMutationRecordsLength = 0
          this.mutationObserver.disconnect()
          resolve({
            layoutSize,
            // TODO: Реализовать установку данного свойства
            displayedElementsCount: this._countOfDisplayedElementsOnPage,
          })
        }
      })
      this.mutationObserver.observe(this.layoutElement.container, {
        childList: true,
        characterData: true,
        subtree: true,
        characterDataOldValue: true,
      })
    })
  }

  handleMutationObserver(layoutSize) {
    this._lastComputedLayoutSize = layoutSize
  }

  /*
   |
   |  Finite-state machine methods
   |
   */
  checkMutationObserverFalseSignal() {
    return (
      !this.layoutElement.size &&
      this.collectionMemento.lastRequiredCollection > 0
    )
  }

  checkEnoughMutationRecords(mutationRecords, changes) {
    // console.log(JSON.stringify(changes))
    //
    // console.log(mutationRecords)
    // for (const mutation of mutationRecords) {
    //   if (mutation.oldValue && mutation.type === 'characterData') {
    //     changes.decChanged()
    //     continue
    //   }
    //   if (
    //     mutation.removedNodes.length &&
    //     !(mutation.removedNodes[0] instanceof Comment)
    //   ) {
    //     changes.decRemoved()
    //     continue
    //   }
    //   if (mutation.addedNodes.length) {
    //     changes.decAdded()
    //     continue
    //   }
    // }
    // added
    // changed
    // removed
    this.collectionMemento.addMutationRecords = mutationRecords.length

    // console.log('Finish', JSON.stringify(changes))
    // return changes.isPass()

    return Boolean(
      this.collectionMemento.lastMutationRecords <
        this.collectionMemento.deltaRequiredCollections &&
        this.collectionMemento.lastRequiredCollection > 0
    )
  }
}
