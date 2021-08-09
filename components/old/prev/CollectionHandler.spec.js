import CollectionHandler from './CollectionHandler'

const testCollection = Array.from({ length: 500 }, (i, k) => k)

describe('CollectionHandler', () => {
  const collectionHandler = new CollectionHandler({ layoutHandler: null })

  test('setCollection', () => {
    collectionHandler.setCollection(testCollection)
    expect(collectionHandler._collection.length).toBe(testCollection.length)
  })

  test('Get small display collection', () => {
    const {
      displayCollection,
      missingElementIndex,
    } = collectionHandler.getDisplayCollection(0, 20)
    expect(displayCollection.length).toBe(20)
    expect(missingElementIndex).toBe(null)
  })

  test('Get small display collection', () => {
    const {
      displayCollection,
      missingElementIndex,
    } = collectionHandler.getDisplayCollection(490, 20)
    expect(displayCollection.length).toBe(10)
    expect(missingElementIndex).toBe(500)
  })
})
