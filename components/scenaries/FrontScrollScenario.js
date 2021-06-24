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
    this.processBusy = true

    const diff = this.getLastScrollPosition() - this.getScrollPosition()
    this.setLastScrollPosition()

    console.log('Init')

    const approximatelyEls =
      Math.ceil(Math.ceil(Math.abs(diff) / this.oneElementSize) / this.grid) *
      this.grid

    const nextLength = this.lastCollectionLength + approximatelyEls
    await this.displayCollection(this.lastDisplayedIndex, nextLength)
    const containerSize = this.getContainerSize()
    console.log(
      this.lastDisplayedIndex,
      this.lastCollectionLength,
      approximatelyEls,
      nextLength
    )
    await this.displayCollection(
      this.lastDisplayedIndex + approximatelyEls,
      nextLength - approximatelyEls
    )
    console.log(
      this.lastDisplayedIndex,
      this.lastCollectionLength,
      approximatelyEls,
      nextLength
    )
    const layoutShift = containerSize - this.getContainerSize()
    this.setLayoutShift(this.layoutShift + Math.abs(layoutShift))

    this.processBusy = false
    this.finishProcess()
  }
}
