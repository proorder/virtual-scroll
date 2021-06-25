import Scenario from '../Scenario'

export default class BackScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine(event) {
    return (
      event === Scenario.EVENTS.SCROLL &&
      this.getLastScrollPosition() - this.getScrollPosition() > 50
    )
  }

  async process() {
    if (this.lastDisplayedIndex === 0) {
      this.finishProcess()
      return
    }
    console.log('Back Scroll Init')
    this.processBusy = true

    const diff = this.getLastScrollPosition() - this.getScrollPosition()
    this.setLastScrollPosition()
    let approximatelyEls =
      Math.ceil(Math.ceil(Math.abs(diff) / this.oneElementSize) / this.grid) *
      this.grid

    const containerSize = this.getContainerSize()
    const nextStartIndex = Math.max(
      this.lastDisplayedIndex - approximatelyEls,
      0
    )
    approximatelyEls = this.lastDisplayedIndex - nextStartIndex

    const layoutShift = await this.displayFromNextStartIndex(
      nextStartIndex,
      containerSize,
      approximatelyEls
    )

    await this.correctCollectionShift(layoutShift, approximatelyEls, diff)

    this.processBusy = false
    this.finishProcess()
  }

  // Метод выводит на экран элементы начиная с указанного индекса и задает
  // layoutShift
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

  // Метод создает дополнительную корректировку коллекции, для более точного
  // определения количества элементов, которые необходимо добавить
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
