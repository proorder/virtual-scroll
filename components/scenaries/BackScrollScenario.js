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
    const nextLength = this.lastCollectionLength + approximatelyEls
    await this.displayCollection(nextStartIndex, nextLength)
    const layoutShift = this.getContainerSize() - containerSize
    this.setLayoutShift(this.layoutShift - layoutShift)
    await this.displayCollection(nextStartIndex, nextLength - approximatelyEls)

    this.processBusy = false
    this.finishProcess()
  }
}
