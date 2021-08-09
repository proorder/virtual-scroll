import {
  pageToIndexes,
  getElementsInScope,
  calculateScopes,
  getCurrentScope,
} from './calculateElementsScope'

describe('calculateElementsScope', () => {
  describe('PageToIndexes', () => {
    test('Second page', () => {
      const indexes = pageToIndexes(2, 10, 40)
      expect(indexes[0]).toBe(10)
      expect(indexes[1]).toBe(19)
    })

    test('First page', () => {
      const indexes = pageToIndexes(1, 5, 40)
      expect(indexes[0]).toBe(0)
      expect(indexes[1]).toBe(4)
    })

    test('Last page with chunk of elements', () => {
      const indexes = pageToIndexes(5, 10, 48)
      expect(indexes[0]).toBe(40)
      expect(indexes[1]).toBe(47)
    })
  })

  describe('GetElementsInScope', () => {
    test('get count of elements in one scope', () => {
      expect(getElementsInScope([0, 12])).toBe(13)
    })
  })

  describe('CalculateScopes', () => {
    test('Ten elements in second scope', () => {
      const { scopes, elementsInScope } = calculateScopes([10, 19], 40)
      expect(elementsInScope).toBe(10)
      expect(scopes).toBe(4)
    })

    test('One element scope', () => {
      const { scopes, elementsInScope } = calculateScopes([5, 5], 10)
      expect(elementsInScope).toBeTruthy()
      expect(scopes).toBeTruthy()
    })
  })

  describe('GetCurrentScope', () => {
    test('First page', () => {
      const elementsScope = getCurrentScope(0, 10)
      expect(elementsScope).toBe(1)
    })

    test('Third page', () => {
      const elementsScope = getCurrentScope(15, 5)
      expect(elementsScope).toBe(4)
    })
  })
})
