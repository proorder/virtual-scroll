import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.SUPER_HIGH

  stateMachine() {
    return !this._layoutHandler.firstCallOccurred
  }

  async process({ minDisplayCollection, index }) {
    await this.setDisplayCollection(index, minDisplayCollection)
    console.log('Приступил к выполнению')
    let layoutSize
    try {
      const result = await this.setDisplayCollection(
        index,
        minDisplayCollection
      )
      layoutSize = result.layoutSize
    } catch (err) {
      console.log('Ошибка резолва', err)
    }
    console.log('Должен быть выполнен')
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
