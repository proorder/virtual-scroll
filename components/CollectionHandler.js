export default class CollectionHandler {
  _collection = []
  _layoutHandler = null

  constructor({ layoutHandler }) {
    this._layoutHandler = layoutHandler
  }

  setCollection(value) {
    if (!this._collection.length) {
      this._collection = value
    }
  }

  getDisplayCollection(startIndex, amount) {
    const displayCollection = this._collection.slice(
      startIndex,
      startIndex + amount
    )

    return {
      displayCollection,
      missingElementIndex:
        displayCollection.length < amount
          ? startIndex + displayCollection.length
          : null,
      endMissingElementIndex: startIndex + amount - displayCollection.length,
    }
  }
}
