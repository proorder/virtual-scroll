import Scenario from '../Scenario'

export default class FrontScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine(event) {
    const scrollDelta = this.getLastScrollPosition() - this.getScrollPosition()
    return (
      event === Scenario.EVENTS.SCROLL &&
      scrollDelta < -50 &&
      scrollDelta > -500
    )
  }

  previousNotRoundedEls = null

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

    // Задача:
    // Продолжать рендер approximatelyEls, только когда их величина достигла grid x2
    const notRoundedEls =
      Math.abs(diff) / this.oneElementSize + (this.previousNotRoundedEls || 0)
    if (notRoundedEls < 2) {
      this.previousNotRoundedEls = notRoundedEls
      this.processBusy = false
      this.finishProcess()
      return
    }
    this.previousNotRoundedEls = notRoundedEls % Math.floor(notRoundedEls)
    const approximatelyEls = Math.floor(notRoundedEls) * this.grid

    const nextLength = Math.min(
      this.lastCollectionLength + approximatelyEls,
      this.collectionLength - this.lastDisplayedIndex // Убавлять ли -1?
    )
    await this.displayCollection(this.lastDisplayedIndex, nextLength)

    console.log(
      this.lastCollectionLength > this.necessaryCollectionLength
        ? 'Добавлять'
        : 'Не добавлять'
    )
    if (this.lastCollectionLength > this.necessaryCollectionLength) {
      const containerSize = this.getContainerSize()
      await this.displayCollection(
        this.lastDisplayedIndex + approximatelyEls,
        nextLength - approximatelyEls
      )

      const layoutShift = containerSize - this.getContainerSize()
      this.setLayoutShift(this.layoutShift + Math.abs(layoutShift))
    }

    if (this.lastDisplayedIndex + this.lastCollectionLength === this.total) {
      const shiftDiff =
        this.layoutSize - (this.layoutShift + this.getContainerSize())
      this.setScrollPosition(this.getLastScrollPosition() + shiftDiff)
      this.setLayoutShift(this.layoutSize - this.getContainerSize())
    }

    // Необходимо включить интервалами, а не на каждый рендер:
    // await this.correctCollectionShift(layoutShift, approximatelyEls, diff)

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
