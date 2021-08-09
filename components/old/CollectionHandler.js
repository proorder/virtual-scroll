export default class CollectionHandler {
  total = 0
  index = 0

  lastDisplayedIndex = 0
  lastRequiredCollectionLength = null

  _collection = []
  _displayCollection = []

  changes = {
    changed: 0,
  }

  set collection(value) {
    if (!this._collection.length) {
      this._collection = value
      return
    }
    this._collection = value
  }

  get collection() {
    return this._collection
  }

  setContext({ total, index }) {
    this.total = total
    this.index = index
  }

  writeChanges(startIndex, amount) {
    if (
      startIndex === this.lastDisplayedIndex &&
      amount === this.lastRequiredCollectionLength
    ) {
      return
    }
    console.log(
      `Prev start ${this.lastDisplayedIndex}`,
      `Prev end ${this.lastRequiredCollectionLength}`,
      `Start ${startIndex}`,
      `End ${amount}`
    )
    const start = Math.max(startIndex, this.lastDisplayedIndex)
    const end = Math.min(
      startIndex + amount,
      this.lastDisplayedIndex + this.lastRequiredCollectionLength
    )
    this.changes.changed = Math.max(end - start, 0)
  }

  getDisplayCollection(startIndex, amount) {
    this.writeChanges(startIndex, amount)
    this.lastDisplayedIndex = startIndex
    this.lastRequiredCollectionLength = amount
    const displayCollection = this._collection.filter(
      (item) => item.index >= startIndex && item.index < startIndex + amount
    )
    this._displayCollection = displayCollection

    return {
      displayCollection,
      viewingIndexes: [startIndex, Math.max(startIndex + amount - 1, 0)],
    }
  }
}
