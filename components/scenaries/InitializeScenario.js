import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.SUPER_HIGH

  stateMachine() {
    return !this._layoutHandler.firstCallOccurred
  }

  async process({ minDisplayCollection, index }) {
    let layoutSize
    while (!layoutSize) {
      const result = await this.setDisplayCollection(
        index,
        minDisplayCollection
      )
      layoutSize = result && result.layoutSize
    }
    await this.setLayoutSize(layoutSize)
    const oneElementSize = this.computeOneElementSize()
    const oneScreenElsCount = this.computeOneScreenElementsCount(oneElementSize)
    const halfScreenEls = Math.ceil(oneScreenElsCount / 2)
    let result
    while (!result) {
      result = await this.setDisplayCollection(
        index,
        oneScreenElsCount + halfScreenEls
      )
    }
    this.setOffset()
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
