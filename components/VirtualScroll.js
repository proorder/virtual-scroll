import deepEqual from 'fast-deep-equal'
import ItemWrapper from './ItemWrapper'

const ITEM_UNIQ_KEY = 'uniqKey'

export default {
  name: 'VirtualScroll',
  props: {
    collection: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    grid: {
      type: Number,
      default: null,
    },
    gap: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 30,
    },
    index: {
      type: Number,
      default: 0,
    },
    rootTag: {
      type: String,
      default: 'div',
    },
    classes: {
      type: Array,
      default: () => [],
    },
    indexKey: {
      type: [String, Function],
      default: 'index',
    },
  },
  data() {
    this.localIndex = this.index
    this.firstOccur = true
    this.fillingCollectionResolver = null
    this.sizes = {}
    this.rowSizes = null
    this.averageItemSize = null
    this.layoutShift = 0
    this.displayedElsCount = null
    return {
      filteredCollection: [],
      layoutSize: 0,
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(value, prev) {
        if (deepEqual(value, prev)) {
          return
        }
        if (this.fillingCollectionResolver) {
          this.fillingCollectionResolver(value)
          this.fillingCollectionResolver = null
          return
        }
        this.formCollection()
      },
    },
  },
  methods: {
    async formCollection() {
      const [start, end] = this.getRange()
      this.$emit('view', [start, end])

      this.filteredCollection = await this.getFilteredCollection([start, end])
    },
    getRenderSlots(h) {
      return this.filteredCollection.map((item) =>
        h(ItemWrapper, {
          key: item[ITEM_UNIQ_KEY],
          props: {
            uniqKey: item[ITEM_UNIQ_KEY],
          },
          scopedSlots: {
            default: () => {
              return this.$scopedSlots.item(item)
            },
          },
          on: {
            resize: (uniqKey, size) => {
              this.registerSize(uniqKey, size)
            },
          },
        })
      )
    },
    registerSize(uniqKey, size) {
      this.sizes[uniqKey] = size
      if (this.checkSizes() && this.firstOccur) {
        this.firstOccur = false
        this.calculateLayoutSize()
      }
    },
    checkSizes() {
      return !this.filteredCollection.find((i) => !this.sizes[i[ITEM_UNIQ_KEY]])
    },
    calculateLayoutSize() {
      const viewSize = this.calculateViewSize()
      this.averageItemSize =
        viewSize / (this.filteredCollection.length / this.grid)
      const oneScreenElsCount =
        this.$el.parentNode.offsetHeight / this.averageItemSize
      this.displayedElsCount = oneScreenElsCount * 2 * this.grid
      this.layoutSize = Math.ceil(this.total / this.grid) * this.averageItemSize
      this.localIndex =
        (Math.ceil((this.index + 1) / this.grid) - 1) * this.grid
    },
    calculateViewSize() {
      if (!this.grid) {
        return this.filteredCollection.reduce((acc, i) => {
          if (acc !== 0) {
            acc += this.gap
          }
          acc += this.sizes[i[ITEM_UNIQ_KEY]]
          return acc
        }, 0)
      }
      const gridAccumulator = []
      for (let i = 1; i <= this.filteredCollection.length; i++) {
        const size = this.sizes[this.filteredCollection[i - 1][ITEM_UNIQ_KEY]]
        if (!size) {
          continue
        }
        const rowIndex = Math.ceil(i / this.grid)
        if (!gridAccumulator[rowIndex]) {
          gridAccumulator[rowIndex] = []
        }
        gridAccumulator[rowIndex].push(size)
      }
      this.rowSizes = gridAccumulator.map((i) => Math.max(...i))
      return this.rowSizes.reduce(
        (acc, i) => acc + i + (acc !== 0 ? this.gap : 0),
        0
      )
    },
    getRange() {
      if (this.firstOccur) {
        return [this.index, this.index + this.min]
      }
      return [this.localIndex, this.localIndex + this.displayedElsCount]
    },
    async getFilteredCollection([start, end]) {
      let collection = this.collection.filter(
        this.collectionFilter([start, end])
      )

      while (collection.length < end - start) {
        await this.waitUntilCollectionIsFull()
        collection = this.collection.filter(this.collectionFilter([start, end]))
      }

      return collection
    },
    collectionFilter([start, end]) {
      return (item) => {
        const uniqKey =
          typeof this.indexKey === 'function'
            ? this.indexKey(item)
            : item[this.indexKey]
        if (uniqKey >= start && uniqKey <= end) {
          item[ITEM_UNIQ_KEY] = uniqKey
          return true
        }
        return false
      }
    },
    waitUntilCollectionIsFull() {
      return new Promise((resolve) => {
        this.fillingCollectionResolver = resolve
      })
    },
  },
  render(h) {
    return h(
      this.rootTag,
      {
        class: {
          'scroll-container': true,
        },
        style: {
          [this.isHorizontal ? 'width' : 'height']: this.layoutSize
            ? `${this.layoutSize}px`
            : 'auto',
        },
      },
      [
        h(
          'div',
          {
            class: {
              'scroll-container__transmitter': true,
              ...Object.fromEntries(this.classes.map((i) => [i, true])),
            },
            style: {
              transform: `translateY(${this.layoutShift}px)`,
            },
            ref: 'transmitter',
          },
          [this.getRenderSlots(h)]
        ),
      ]
    )
  },
}
