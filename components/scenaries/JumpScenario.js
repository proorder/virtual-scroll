import Scenario from '../Scenario'

export default class JumpScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine() {
    const scrollDelta = this.getLastScrollPosition() - this.getScrollPosition()
    return this._layoutHandler.firstCallOccurred && Math.abs(scrollDelta) > 500
  }

  async process() {
    console.log('Jump Init')
    this.setLastScrollPosition()

    const index = this.getIndexByOffset()
    await this.displayCollection(index, this.oneScreenElsCount)
    this.setLayoutShift(this.getLastScrollPosition())

    this.finishProcess()
  }
}
