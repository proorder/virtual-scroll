export function getScrollElement(element) {
  switch (true) {
    case element instanceof Window:
      return document.scrollingElement
    default:
      return element
  }
}
