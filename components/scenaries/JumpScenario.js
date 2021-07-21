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

    /*
     |
     |  Первая половина рассчетов. Из нее:
     |  - getIndexByOffset
     |  - getHalfScreenEls
     |  - displayCollection 0
     |  - Коррекция начального индекса на случай выхода коллекции за пределы
     |  - Отображение displayCollection
     |
     */
    const {
      index,
      halfScreenEls,
      correctedDisplayLength,
    } = await this.firstHalfPreparingData()

    if (index === 0) {
      this.setLayoutShift(0)
      this.finishProcess()
      return
    }

    const previousContainerSize = this.getContainerSize()

    await this.secondHalfPreparingData(
      index,
      halfScreenEls,
      correctedDisplayLength
    )

    const layoutShift =
      this.getLastScrollPosition() +
      previousContainerSize -
      this.getContainerSize()

    if (layoutShift >= 0) {
      /*
       |
       |  Если лэйаут вышел за пределы, необходимо уменьшить отступ и
       |  сохранить скролл
       |
       */
      if (layoutShift + this.getContainerSize() > this.layoutSize) {
        const rightLayoutShift = this.layoutSize - this.getContainerSize()
        this.setLayoutShift(rightLayoutShift)
        const scrollDelta = layoutShift - rightLayoutShift
        this.setScrollPosition(this.getScrollPosition() - scrollDelta)
      } else {
        this.setLayoutShift(layoutShift)
      }
    } else {
      const scrollPosition = this.getScrollPosition()
      this.setScrollPosition(scrollPosition + Math.abs(layoutShift))
    }

    this.finishProcess()
  }

  async firstHalfPreparingData() {
    let index = this.getIndexByOffset()
    const halfScreenEls = this.getHalfScreenEls(index, this.oneScreenElsCount)

    await this.displayCollection(index, 0)

    let correctedDisplayLength = this.oneScreenElsCount + halfScreenEls
    /*
     |
     |  Проверка на выход за пределы коллекции
     |
     */
    const lastEl = index + this.oneScreenElsCount + halfScreenEls
    if (lastEl > this.total) {
      const correctedStartIndex =
        this.total - (this.oneScreenElsCount + halfScreenEls) - 1
      index = Math.max(correctedStartIndex, 0)
      correctedDisplayLength = this.total - index
    }

    await this.displayCollection(index, correctedDisplayLength)
    console.log(
      index,
      correctedDisplayLength,
      this.oneScreenElsCount,
      halfScreenEls
    )

    return { index, halfScreenEls, correctedDisplayLength }
  }

  async secondHalfPreparingData(index, halfScreenEls, correctedDisplayLength) {
    const backOffset = Math.max(index - halfScreenEls, 0)
    const delta = backOffset - Math.abs(index - halfScreenEls)
    await this.displayCollection(
      backOffset,
      halfScreenEls + correctedDisplayLength - delta
    )
  }
}
