import Scenario from '../Scenario'

export default class BackScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine(event) {
    const scrollDelta = this.getLastScrollPosition() - this.getScrollPosition()
    return (
      event === Scenario.EVENTS.SCROLL && scrollDelta > 50 && scrollDelta < 500
    )
  }

  previousNotRoundedEls = null

  async process() {
    if (this.lastDisplayedIndex === 0) {
      this.finishProcess()
      return
    }
    console.log('Back Scroll Init')
    this.processBusy = true

    const diff = this.getLastScrollPosition() - this.getScrollPosition()
    this.setLastScrollPosition()

    const notRoundedEls =
      Math.abs(diff) / this.oneElementSize + (this.previousNotRoundedEls || 0)
    if (notRoundedEls < 2) {
      this.previousNotRoundedEls = notRoundedEls
      this.processBusy = false
      this.finishProcess()
      return
    }

    this.previousNotRoundedEls = notRoundedEls % Math.floor(notRoundedEls)
    let approximatelyEls = Math.floor(notRoundedEls) * this.grid

    const containerSize = this.getContainerSize()
    const nextStartIndex = Math.max(
      this.lastDisplayedIndex - approximatelyEls,
      0
    )
    approximatelyEls = this.lastDisplayedIndex - nextStartIndex

    /* const layoutShift = */ await this.displayFromNextStartIndex(
      nextStartIndex,
      containerSize,
      approximatelyEls
    )

    if (this.lastDisplayedIndex === 0 && this.layoutShift !== 0) {
      this.setScrollPosition(this.getLastScrollPosition() - this.layoutShift)
      this.setLayoutShift(0)
    }

    /*
     |
     |  Необходимо включить интервалами, а не на каждый рендер:
     |  await this.correctCollectionShift(layoutShift, approximatelyEls, diff)
     |
     */

    this.processBusy = false
    this.finishProcess()
  }

  /*
   |
   |  Метод выводит на экран элементы начиная с указанного индекса и задает
   |  layoutShift
   |
   */
  async displayFromNextStartIndex(
    nextStartIndex,
    containerSize,
    approximatelyEls
  ) {
    const nextLength = this.lastCollectionLength + approximatelyEls
    await this.displayCollection(nextStartIndex, nextLength)
    const layoutShift = this.getContainerSize() - containerSize
    this.setLayoutShift(this.layoutShift - layoutShift)
    await this.displayCollection(nextStartIndex, nextLength - approximatelyEls)
    return layoutShift
  }

  /*
   |
   |  Метод создает дополнительную корректировку коллекции, для более точного
   |  определения количества элементов, которые необходимо добавить
   |
   */
  async correctCollectionShift(layoutShift, approximatelyEls, diff) {
    const previousAdded = approximatelyEls / this.grid
    const oneElementSize = layoutShift / previousAdded
    const correction =
      (Math.ceil(diff / oneElementSize) - previousAdded) * this.grid
    if (!correction) {
      return
    }
    const nextStartIndex = Math.max(this.lastDisplayedIndex - correction, 0)
    await this.displayFromNextStartIndex(
      nextStartIndex,
      this.getContainerSize(),
      this.lastDisplayedIndex - nextStartIndex
    )
  }
}
