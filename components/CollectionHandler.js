export default class CollectionHandler {
  lastRequiredCollectionLength = null
  total = 0
  index = 0

  lastDisplayedIndex = 0
  _collection = []
  _displayCollection = []

  setContext({ total, index }) {
    this.total = total
    this.index = index
  }

  setCollection(value) {
    if (!this._collection.length) {
      this._collection = value
      return
    }
    this._collection = value
  }

  getDisplayCollection(startIndex, amount) {
    this.lastDisplayedIndex = startIndex
    this.lastRequiredCollectionLength = amount
    const displayCollection = this._collection.filter(
      (item) => item.index >= startIndex && item.index < startIndex + amount
    )
    this._displayCollection = displayCollection

    return {
      displayCollection,
      viewingIndexes: [startIndex, Math.max(startIndex + amount - 1, 0)],
      missingElementIndex:
        displayCollection.length < amount
          ? startIndex + displayCollection.length
          : null,
      endMissingElementIndex: startIndex + amount - displayCollection.length,
    }
  }
}
