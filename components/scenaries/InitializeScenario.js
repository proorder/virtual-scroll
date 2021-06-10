import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.SUPER_HIGH

  stateMachine() {
    return !this._layoutHandler.firstCallOccurred
  }

  async process({ minDisplayCollection, index }) {
    await this.setDisplayCollection(index, minDisplayCollection)
    const { layoutSize } = await this.setDisplayCollection(
      index,
      minDisplayCollection
    )
    await this.setLayoutSize(layoutSize)
    const oneElementSize = this.computeOneElementSize()
    const oneScreenElsCount = this.computeOneScreenElementsCount(oneElementSize)
    let result
    while (!result) {
      result = await this.setDisplayCollection(index, oneScreenElsCount)
    }

    // this.setOffset()
    // this.setDisplayCollectionPrefix()
    // this.setDisplayCollectionSuffix()
  }

  // Смещает начальный индекс отображаемой коллекции к началу
  // на количество элементов равное половине экрана
  setDisplayCollectionPrefix() {}

  // Смещает конечный индекс отображаемой коллекции к концу
  // на количество элементов равное половине экрана
  setDisplayCollectionSuffix() {}
}
