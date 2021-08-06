export default class CollectionHandler {
  pages = []
  _total = 0
  _limit = 0
  _totalPages = 0
  _collection = []
  _callLoadPages = () => {}
  _updateDisplayCollection = () => {}
  limit = 20

  constructor({
    collection,
    total,
    limit,
    callLoadPages,
    updateDisplayCollection,
  }) {
    this._collection = collection
    this._total = total
    this._limit = limit
    this._totalPages = Math.ceil(this._total / this._limit)
    this._callLoadPages = callLoadPages
    this._updateDisplayCollection = updateDisplayCollection
  }

  update(collection) {
    this._collection = [...collection]
  }

  /**
   * Array of promises
   * @param firstDisplay - if display is first,
   * returns one page collection for measure occupied space
   */
  getPromises({
    page: currentPage,
    firstDisplay = false,
    pages: countOfPagesOnScreen,
  }) {
    if (firstDisplay) {
      this.pages = [currentPage]
    } else {
      const pagesArray = Array.from(
        { length: this._totalPages },
        (v, k) => k + 1
      )

      const findIndex = (page) => {
        for (const i in pagesArray) {
          if (pagesArray[i] === page) {
            return Number.parseInt(i)
          }
        }
      }
      const sliceLayer = (page, end = -1) => {
        const currentIndex = findIndex(page)
        const endIndex =
          currentIndex + (end !== -1 ? end : countOfPagesOnScreen)
        return currentIndex === endIndex
          ? []
          : pagesArray.slice(currentIndex, endIndex)
      }
      const currentLayer = sliceLayer(currentPage)
      let previousLayer = []
      let additionalLayer = []
      if (
        currentLayer[currentLayer.length - 1] <
        pagesArray[pagesArray.length - 1]
      ) {
        additionalLayer = sliceLayer(currentLayer[currentLayer.length - 1] + 1)
      }
      if (currentLayer[0] > 0) {
        const leftOffset = currentLayer[0] - 1 - countOfPagesOnScreen
        previousLayer = sliceLayer(
          leftOffset < 0 ? 1 : leftOffset,
          findIndex(currentLayer[0])
        )
      }
      this.pages = [...previousLayer, ...currentLayer, ...additionalLayer].sort(
        (a, b) => a - b
      )
      this._callLoadPages(this.pages)
    }
    // TODO: Требует проверки
    return this.pages.flatMap((page) => {
      const pageCollection = this._collection.filter(
        (item) => item._page === page
      )
      return Array.from({ length: this._limit }, (v, k) => k).map((index) => {
        return new Promise((resolve, reject) => {
          const sleep = 120
          let timeout = 0
          if (pageCollection.length > 0) {
            resolve(pageCollection[index])
          } else {
            const checkItemExist = () => {
              const item = this._collection.filter((p) => p._page === page)[
                index
              ]
              if (item) {
                // Отключить, если используется displayCollection без промисов
                this._updateDisplayCollection(page, item)
                resolve(item)
              } else if (timeout < 5000) {
                setTimeout(() => {
                  timeout += 120
                  if (process.client) {
                    window.requestAnimationFrame(checkItemExist)
                  } else {
                    checkItemExist()
                  }
                }, sleep)
              }
            }
            checkItemExist()
          }
        })
      })
    })
  }

  /**
   * Returns Map of groups with index according promises collection keys
   * @returns {Map<any, any>}
   */
  getAccordingCollectionGroupsMap() {
    return new Map()
  }
}
