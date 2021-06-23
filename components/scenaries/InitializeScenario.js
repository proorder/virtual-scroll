import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.SUPER_HIGH

  stateMachine() {
    return !this._layoutHandler.firstCallOccurred
  }

  async process({ minDisplayCollection, index }) {
    // Команда: Вывести на экран минимальное количество элементов.
    // Комментарий: Это действие совершается для того, чтобы определить размер
    // одного элемента, учитывая сетку.
    const { layoutSize } = await this.displayCollection(
      index,
      minDisplayCollection
    )
    // Команда: Установить размер лэйаута
    // Комментарий: Во избежании layout shift браузера
    // при заполнении коллекции элементами, создается запас размера
    await this.setLayoutSize(layoutSize)
    const oneElementSize = this.computeOneElementSize()
    // Команда: Вычислить приблизительное количество элементов на одном экране
    const oneScreenElsCount = this.computeOneScreenElementsCount(oneElementSize)
    // Данное количество, отнимаемое от index будет являться
    // фактическим начальным индексом. Соотвественно должно отталкиваться от
    // grid
    const halfScreenEls = this.getHalfScreenEls(index, oneScreenElsCount)
    // Команда: Вывести полтора экрана элементов
    await this.displayCollection(index, oneScreenElsCount + halfScreenEls)
    this.setOffset()
    const previousContainerSize = this.getContainerSize()
    // Команда: Сместить начальный индекс,
    // увеличить отображаемое количество элементов
    await this.displayCollection(
      Math.max(index - halfScreenEls, 0),
      oneScreenElsCount + halfScreenEls * 2
    )
    // Команда: Сместить отступ контейнера
    this.setLayoutShift(
      this.getLastScrollPosition() +
        previousContainerSize -
        this.getContainerSize()
    )

    // Команда: Завершить процесс. Удалить из стэка выполняемых
    this.finishProcess()
  }

  getHalfScreenEls(index, oneScreenElsCount) {
    const half = Math.ceil(oneScreenElsCount / 2)
    const delta = index - half - ((index - half) % this.grid)
    return index - delta
  }

  // Смещает начальный индекс отображаемой коллекции к началу
  // на количество элементов равное половине экрана
  setDisplayCollectionPrefix() {}

  // Смещает конечный индекс отображаемой коллекции к концу
  // на количество элементов равное половине экрана
  setDisplayCollectionSuffix() {}
}
