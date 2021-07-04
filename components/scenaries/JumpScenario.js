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
    const halfScreenEls = this.getHalfScreenEls(index, this.oneScreenElsCount)

    // Если выход за пределы коллекции
    // if (index + this.oneScreenElsCount + halfScreenEls > this.total) {
    //   index = Math.max(this.total - (this.oneScreenElsCount + halfScreenEls), 0)
    // }

    await this.displayCollection(index, this.oneScreenElsCount + halfScreenEls)
    this.setLayoutShift(this.getLastScrollPosition())

    const previousContainerSize = this.getContainerSize()

    await this.displayCollection(
      Math.max(index - halfScreenEls, 0),
      this.oneScreenElsCount + halfScreenEls * 2
    )

    this.setLayoutShift(
      this.getLastScrollPosition() +
        previousContainerSize -
        this.getContainerSize()
    )

    this.finishProcess()
  }
}
