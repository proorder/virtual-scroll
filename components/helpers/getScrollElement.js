export function getScrollElement(element) {
  if (element instanceof Window) {
    return document.scrollingElement
  }
  return element
}
