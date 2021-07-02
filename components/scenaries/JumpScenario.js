import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine() {
    const scrollDelta = this.getLastScrollPosition() - this.getScrollPosition()
    return this._layoutHandler.firstCallOccurred && Math.abs(scrollDelta) > 500
  }

  process() {
    console.log(
      'Jump Init',
      this.getLastScrollPosition() - this.getScrollPosition()
    )
    this.setLastScrollPosition()

    const index = this.getIndexByOffset()
    console.log(this.oneScreenElsCount, this.oneElementSize)
    setTimeout(async () => {
      await this.displayCollection(index, this.oneScreenElsCount)
      this.setLayoutShift(this.getLastScrollPosition())
    }, 3000)

    this.finishProcess()
  }
}
