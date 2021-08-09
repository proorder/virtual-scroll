import ItemWrapper from './ItemWrapper'

export default {
  name: 'VirtualScroll',
  props: {
    collection: {
      type: Array,
      default: () => [],
    },
    rootTag: {
      type: String,
      default: 'div',
    },
    classes: {
      type: Array,
      default: () => [],
    },
    dataKey: {
      type: [String, Function],
    },
  },
  methods: {
    getRenderSlots(h) {
      const slots = []
      const { start, end } = this.getRange()
      for (let i = start; i <= end; i++) {
        const data = this.collection[i]
        if (!data) {
          continue
        }
        const uniqKey =
          typeof this.dataKey === 'function'
            ? this.dataKey(data)
            : data[this.dataKey]
        if (!uniqKey && typeof uniqKey !== 'number') {
          continue
        }
        slots.push(h(ItemWrapper, { props: {}, style: {}, class: {} }))
      }

      return slots
    },
  },
  render(h) {
    return h(
      this.rootTag,
      {
        class: {
          'scroll-container': true,
          ...Object.fromEntries(this.classes.map((i) => [i, true])),
        },
        style: {},
      },
      this.getRenderSlots()
    )
  },
}
