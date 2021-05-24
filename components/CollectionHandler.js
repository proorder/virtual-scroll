export default class CollectionHandler {
  _collection = []
  _layoutHandler = null

  constructor({ layoutHandler }) {
    this._layoutHandler = layoutHandler
  }

  setCollection(value) {
    // const { newItems } = this.getCollectionsDifferences(this._collection, value)
    if (!this._collection.length) {
      this._collection = value
    }
  }

  getCollectionsDifferences(oldCollection, newCollection) {
    return {
      newItems: [],
      deletedItems: [],
    }
  }

  getDisplayCollection() {
    return this._collection
  }
}
