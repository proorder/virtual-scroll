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

    await this.displayCollection(index, 0)

    // Если выход за пределы коллекции
    // if (index + this.oneScreenElsCount + halfScreenEls > this.total) {
    //   index = Math.max(this.total - (this.oneScreenElsCount + halfScreenEls), 0)
    // }

    await this.displayCollection(index, this.oneScreenElsCount + halfScreenEls)

    if (index === 0) {
      this.setLayoutShift(0)
      this.finishProcess()
      return
    }

    const previousContainerSize = this.getContainerSize()

    const backOffset = Math.max(index - halfScreenEls, 0)
    const delta = backOffset - Math.abs(index - halfScreenEls)
    await this.displayCollection(
      backOffset,
      this.oneScreenElsCount + halfScreenEls * 2 - delta
    )

    const layoutShift =
      this.getLastScrollPosition() +
      previousContainerSize -
      this.getContainerSize()

    if (layoutShift >= 0) {
      this.setLayoutShift(layoutShift)
    } else {
      const scrollPosition = this.getScrollPosition()
      this.setScrollPosition(scrollPosition + Math.abs(layoutShift))
    }

    this.finishProcess()
  }
}
