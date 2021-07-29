import Scenario from '../Scenario'

export default class InitializeScenario extends Scenario {
  priority = Scenario.PRIORITIES.SUPER_HIGH

  stateMachine() {
    return !this._layoutHandler.firstCallOccurred
  }

  async process({ minDisplayCollection, index }) {
    /*
     |
     |  Команда: Вывести на экран минимальное количество элементов.
     |  Комментарий: Это действие совершается для того, чтобы определить размер
     |  одного элемента, учитывая сетку.
     |
     */
    const { layoutSize } = await this.displayCollection(
      index,
      minDisplayCollection
    )

    /*
     |
     |  Команда: Установить размер лэйаута
     |  Комментарий: Во избежании layout shift браузера
     |  при заполнении коллекции элементами, создается запас размера
     |
     */
    await this.setLayoutSize(layoutSize)

    const oneElementSize = this.computeOneElementSize()

    /*
     |
     |  Команда: Вычислить приблизительное количество элементов на одном экране
     |
     */
    const oneScreenElsCount = this.computeOneScreenElementsCount(oneElementSize)
    /*
     |
     |  Данное количество, отнимаемое от index будет являться
     |  фактическим начальным индексом. Соотвественно должно отталкиваться от
     |  grid
     |
     */
    const halfScreenEls = this.getHalfScreenEls(index, oneScreenElsCount)
    this.necessaryCollectionLength = oneScreenElsCount + halfScreenEls * 2
    /*
     |
     |  Команда: Вывести полтора экрана элементов
     |
     */
    const { layoutSize: intermediateLayoutSize } = await this.displayCollection(
      index,
      oneScreenElsCount + halfScreenEls
    )
    this.setOffset()

    if (this.lastDisplayedIndex > 0) {
      const previousContainerSize = this.getContainerSize()
      /*
       |
       |  Команда: Сместить начальный индекс,
       |  увеличить отображаемое количество элементов
       |
       */
      const { layoutSize: lastLayoutSize } = await this.displayCollection(
        Math.max(index - halfScreenEls, 0),
        oneScreenElsCount + halfScreenEls * 2
      )

      /*
       |
       |  Команда: Сместить отступ контейнера
       |
       */
      this.setLayoutShift(
        this.getLastScrollPosition() +
          previousContainerSize -
          this.getContainerSize()
      )

      await this.setLayoutSize(lastLayoutSize)
    } else {
      await this.setLayoutSize(intermediateLayoutSize)
    }

    /*
     |
     |  Команда: Завершить процесс. Удалить из стэка выполняемых
     |
     */
    this.finishProcess()
  }

  /*
   |
   |  Смещает начальный индекс отображаемой коллекции к началу
   |  Сна количество элементов равное половине экрана
   |
   */
  setDisplayCollectionPrefix() {}

  /*
   |
   |  Смещает конечный индекс отображаемой коллекции к концу
   |  на количество элементов равное половине экрана
   |
   */
  setDisplayCollectionSuffix() {}
}
