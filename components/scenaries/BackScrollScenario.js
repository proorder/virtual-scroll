import Scenario from '../Scenario'

export default class BackScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  processBusy = false

  stateMachine(event) {
    return (
      event === Scenario.EVENTS.SCROLL &&
      this.getLastScrollPosition() - this.getScrollPosition() > 100
    )
  }

  async process() {
    if (this.processBusy) {
      return
    }
    if (this.lastDisplayedIndex === 0) {
      this.finishProcess()
      return
    }
    this.processBusy = true
    const diff = this.getLastScrollPosition() - this.getScrollPosition()
    this.setLastScrollPosition()
    const approximatelyEls = Math.ceil(diff / this.oneElementSize) * this.grid

    const containerSize = this.getContainerSize()
    const nextStartIndex = Math.max(
      this.lastDisplayedIndex - approximatelyEls,
      0
    )
    const nextLength = this.lastCollectionLength + approximatelyEls
    await this.displayCollection(nextStartIndex, nextLength)
    console.log(containerSize, this.getContainerSize(), this.layoutShift)
    this.setLayoutShift(
      this.layoutShift - (this.getContainerSize() - containerSize)
    )

    this.processBusy = false
    this.finishProcess()
  }
}
