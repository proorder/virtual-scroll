import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  stateMachine() {}

  async process() {
    this.setDisplayCollection(this.index, this.minDisplayedEls)
    await this.mutationHasOccurred()
    const elementSize = this.computeOneElementSize(this.minDisplayedEls)
    const layoutSize = this.computeLayoutSize(
      elementSize,
      this.collectionLength
    )
    this.setLayoutSize(layoutSize)
    this.computeOneScreenElementsCount()
    this.setOffset()
    this.setDisplayCollectionPrefix()
    this.setDisplayCollectionSuffix()
  }

  // Смещает начальный индекс отображаемой коллекции к началу
  // на количество элементов равное половине экрана
  setDisplayCollectionPrefix() {}

  // Смещает конечный индекс отображаемой коллекции к концу
  // на количество элементов равное половине экрана
  setDisplayCollectionSuffix() {}
}
