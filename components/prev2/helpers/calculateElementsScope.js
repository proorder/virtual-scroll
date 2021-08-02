export function pageToIndexes(page, limit, total) {
  const firstIndex = (page - 1) * limit
  const secondIndex = Math.floor(page * limit) - 1

  return [firstIndex, secondIndex + 1 >= total ? total - 1 : secondIndex]
}

export function getElementsInScope(elements) {
  return elements[1] - elements[0] + 1
}

export function calculateScopes(elements, total) {
  const elementsInScope = getElementsInScope(elements)
  const scopes = Math.ceil(total / elementsInScope)
  return {
    scopes,
    elementsInScope,
  }
}

export function getCurrentScope(elementIndex, elementsInScope) {
  return Math.ceil((elementIndex + 1) / elementsInScope)
}
