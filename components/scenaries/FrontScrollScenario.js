import Scenario from '../Scenario'

export default class FrontScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine(event) {
    return (
      event === Scenario.EVENTS.SCROLL &&
      this.getLastScrollPosition() - this.getScrollPosition() < -50
    )
  }

  async process() {
    if (
      this.lastDisplayedIndex + this.lastCollectionLength ===
      this.collectionLength
    ) {
      this.finishProcess()
      return
    }
    this.processBusy = true

    const diff = this.getLastScrollPosition() - this.getScrollPosition()
    this.setLastScrollPosition()

    console.log('Front Scroll Init')

    const approximatelyEls =
      Math.ceil(Math.ceil(Math.abs(diff) / this.oneElementSize) / this.grid) *
      this.grid

    const nextLength = Math.min(
      this.lastCollectionLength + approximatelyEls,
      this.collectionLength - this.lastDisplayedIndex // Убавлять ли -1?
    )
    await this.displayCollection(this.lastDisplayedIndex, nextLength)
    const containerSize = this.getContainerSize()
    await this.displayCollection(
      this.lastDisplayedIndex + approximatelyEls,
      nextLength - approximatelyEls
    )
    const layoutShift = containerSize - this.getContainerSize()
    this.setLayoutShift(this.layoutShift + Math.abs(layoutShift))

    await this.correctCollectionShift(layoutShift, approximatelyEls, diff)

    this.processBusy = false
    this.finishProcess()
  }

  // Метод создает дополнительную корректировку коллекции, для более точного
  // определения количества элементов, которые необходимо добавить
  async correctCollectionShift(layoutShift, approximatelyEls, diff) {
    const previousAdded = approximatelyEls / this.grid
    const oneElementSize = layoutShift / previousAdded
    let correction =
      (Math.ceil(Math.abs(diff) / oneElementSize) - previousAdded) * this.grid
    if (!correction) {
      return
    }
    const nextLength = Math.min(
      this.lastCollectionLength + correction,
      this.collectionLength - this.lastDisplayedIndex
    ) // *
    correction = nextLength - this.lastCollectionLength
    await this.displayCollection(this.lastDisplayedIndex, nextLength)
    const containerSize = this.getContainerSize()
    await this.displayCollection(
      this.lastDisplayedIndex + correction,
      nextLength - correction
    )
    this.setLayoutShift(
      this.layoutShift + Math.abs(containerSize - this.getContainerSize())
    )
  }
}
