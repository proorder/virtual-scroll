import debounce from 'lodash.debounce'
import deepEqual from 'fast-deep-equal'
import ItemWrapper from './ItemWrapper'
import { getScrollElement } from './helpers/getScrollElement'

const ITEM_UNIQ_KEY = 'uniqKey'

const LARGE_SCROLL = 600

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
      default: 100,
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
    scrollSelector: {
      type: [String, Object],
      default: null,
    },
  },
  data() {
    this.startIndex = this.index
    this.multipleIndex = this.index
    this.firstOccur = true
    this.fillingCollectionResolver = null
    this.sizes = {}
    this.rowSizes = null
    this.averageItemSize = null
    this.layoutShift = 0
    this.displayedElsCount = null
    this.oneScreenElsCount = 0
    this.waitShiftResolver = false
    this.firstHalfSize = null
    this.scrollElement = null
    this.scrollPosition = null
    return {
      filteredCollection: [],
      layoutSize: 0,
      layoutShift: 0,
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
  mounted() {
    this.setupScrollElement()
    this.scrollElement.addEventListener('scroll', this.onScroll, {
      passive: false,
    })
  },
  beforeDestroy() {
    this.scrollElement.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll: debounce(function () {
      const delta = this.getScroll() - this.scrollPosition
      if (delta === 0) {
        return
      }
      console.log('Scroll Delta', this.scrollPosition)
      if (Math.abs(delta) > LARGE_SCROLL) {
        setTimeout(this.doJump.bind(this, delta), 0)
      } else if (delta < 0 && this.checkOutBackMove(delta)) {
        setTimeout(this.moveBack.bind(this, delta), 0)
      } else if (delta > 0 && this.checkOutFrontMove(delta)) {
        setTimeout(this.moveFront.bind(this, delta), 0)
      }
    }, 30),
    checkOutBackMove(delta) {
      const accumulator = []
      for (
        let i = this.startIndex + this.displayedElsCount - 1;
        i > this.startIndex + this.displayedElsCount - 1 - this.grid;
        i--
      ) {
        if (!this.sizes[i]) {
          continue
        }
        accumulator.push(this.sizes[i])
      }
      return Math.max(...accumulator) + this.gap < Math.abs(delta)
    },
    checkOutFrontMove(delta) {
      const accumulator = []
      for (let i = this.startIndex; i < this.startIndex + this.grid; i++) {
        if (!this.sizes[i]) {
          continue
        }
        accumulator.push(this.sizes[i])
      }
      return Math.max(...accumulator) + this.gap < delta
    },
    moveBack(delta) {
      this.setScroll()
      if (this.startIndex === 0) {
        return
      }
      let shift = Math.abs(delta)
      let a = 0
      while (true) {
        const accumulator = []
        for (
          let i = this.startIndex + this.displayedElsCount - 1 - this.grid * a;
          i >
          this.startIndex +
            this.displayedElsCount -
            1 -
            this.grid -
            this.grid * a;
          i--
        ) {
          if (!this.sizes[i]) {
            continue
          }
          accumulator.push(this.sizes[i])
        }
        if (!accumulator.length) {
          break
        }
        const rowSize = Math.max(...accumulator) + this.gap
        if (rowSize < shift) {
          shift -= rowSize
          a += 1
        } else {
          // TODO: Set size equal averageRowSize
          break
        }
      }
      this.scrollPosition += shift
      let indexOffset = a * this.grid
      if (this.startIndex - indexOffset < 0) {
        indexOffset = indexOffset + (this.startIndex - indexOffset)
      }
      this.startIndex -= indexOffset
      this.multipleIndex -= indexOffset
      // eslint-disable-next-line
      const containerSize = this.$refs.transmitter.offsetHeight
      setTimeout(() => {
        this.formCollection(indexOffset).then(() => {
          const layoutShift =
            Math.abs(delta) -
            shift +
            (this.$refs.transmitter.offsetHeight - containerSize)
          this.formCollection().then(() => {
            const nextShift = this.layoutShift - layoutShift
            if (nextShift < 0 || (nextShift > 0 && this.startIndex === 0)) {
              const layoutShift = this.layoutShift
              this.layoutShift = 0
              // TODO: Разгрезти и понять в чем причина
              console.log(
                this.layoutShift,
                nextShift,
                this.getScroll(),
                this.getScroll() - this.layoutShift
              )
              requestAnimationFrame(() => {
                this.setScroll(this.getScroll() - layoutShift)
              })
              return
            }
            this.layoutShift -= layoutShift
          })
        })
      }, 0)
    },
    moveFront(delta) {
      this.setScroll()
      let shift = delta
      let a = 0
      if (this.startIndex === 0) {
        this.calculateHalfSize()
        if (this.firstHalfSize > this.scrollPosition) {
          return
        }
      }
      while (true) {
        const accumulator = []
        for (
          let i = this.startIndex + this.grid * a;
          i < this.startIndex + this.grid + this.grid * a;
          i++
        ) {
          if (!this.sizes[i]) {
            continue
          }
          accumulator.push(this.sizes[i])
        }
        if (!accumulator.length) {
          // TODO: Set size equal averageRowSize
          break
        }
        const rowSize = Math.max(...accumulator) + this.gap
        if (rowSize < shift) {
          shift -= rowSize
          a += 1
        } else {
          break
        }
      }
      this.scrollPosition -= shift
      this.startIndex += a * this.grid
      this.multipleIndex += a * this.grid
      this.formCollection().then(() => {
        this.layoutShift += delta - shift
      })
    },
    doJump() {
      console.log('Jump')
      const index = this.getIndexByOffset()
      this.renderFromIndex(index)
    },
    getIndexByOffset() {
      return Math.floor(this.getScroll() / this.averageItemSize) * this.grid
    },
    getSizesRow(row) {
      const accumulator = []
      for (
        let i = this.startIndex + this.grid * row;
        i < this.startIndex + this.grid * row + this.grid;
        i++
      ) {
        if (!this.sizes[i]) {
          continue
        }
        accumulator.push(this.sizes[i])
      }
      return Math.max(...accumulator)
      // return accumulator.length
      //   ? Math.max(...accumulator)
      //   : this.averageItemSize
    },
    async formCollection(offset = null) {
      const [start, end] = this.getRange()
      console.log('ViewIndex', start)
      this.$emit('view', [start, end])

      if (!offset) {
        this.filteredCollection = await this.getFilteredCollection([start, end])
        return
      }
      let collection = await this.getFilteredCollection([start, end + offset])
      collection = [
        ...collection.slice(offset, end - start),
        ...collection.slice(0, offset),
      ]
      this.filteredCollection = collection
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
      if (!this.checkSizes()) {
        return
      }
      if (this.firstOccur) {
        this.firstOccur = false
        this.calculateLayoutSize()
        this.renderFromIndex(this.index)
        // Установить позицию скролла
      }
      if (this.waitShiftResolver) {
        this.waitShiftResolver()
        this.waitShiftResolver = null
      }
    },
    checkSizes() {
      return !this.filteredCollection.find((i) => !this.sizes[i[ITEM_UNIQ_KEY]])
    },
    getScreenSize() {
      return this.$el.parentNode.offsetHeight
    },
    getScroll() {
      return getScrollElement(this.scrollElement).scrollTop
    },
    setScroll(scroll = null) {
      if (scroll === null) {
        this.scrollPosition = getScrollElement(this.scrollElement).scrollTop
        return
      }
      this.scrollPosition = scroll
      getScrollElement(this.scrollElement).scrollTop = scroll
    },
    setupScrollElement() {
      this.scrollElement = this.scrollSelector
        ? this.scrollSelector === 'document'
          ? window
          : document.querySelector(this.scrollSelector)
        : document.documentElement || document.body
    },
    calculateHalfSize() {
      if (this.lastCalculatedStartIndex === this.startIndex) {
        console.log('Куда пошел')
        return
      }
      const gridAccumulator = []
      for (let i = this.startIndex; i < this.multipleIndex; i++) {
        const rowIndex = Math.ceil(i / this.grid)
        if (!this.sizes[i]) {
          continue
        }
        if (!gridAccumulator[rowIndex]) {
          gridAccumulator[rowIndex] = []
        }
        gridAccumulator[rowIndex].push(this.sizes[i])
      }
      this.lastCalculatedStartIndex = this.startIndex
      this.firstHalfSize = gridAccumulator
        .map((s) => Math.max.apply(null, s))
        .reduce((acc, i) => acc + i + (acc !== 0 ? this.gap : 0), 0)
    },
    shiftLayout() {
      const { shift, scroll } = this.calculateOffsetByIndex()
      this.layoutShift = Math.max(shift, 0)
      if (this.grid > 1) {
        this.setScroll(scroll + (shift < 0 ? Math.abs(shift) : 0))
      } else {
        requestAnimationFrame(() => {
          this.setScroll(scroll + (shift < 0 ? Math.abs(shift) : 0))
        })
      }
    },
    calculateOffsetByIndex() {
      const rowCount = (this.multipleIndex + 1) / this.grid
      const scroll = rowCount * (this.averageItemSize + this.gap)

      return {
        shift: scroll - this.firstHalfSize,
        scroll,
      }
    },
    calculateLayoutSize() {
      const viewSize = this.calculateViewSize()
      this.averageItemSize =
        viewSize / (this.filteredCollection.length / this.grid)
      this.oneScreenElsCount =
        Math.ceil(this.getScreenSize() / this.averageItemSize) * this.grid
      this.layoutSize = Math.ceil(this.total / this.grid) * this.averageItemSize
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
    renderFromIndex(index) {
      this.multipleIndex = (Math.ceil((index + 1) / this.grid) - 1) * this.grid
      this.startIndex = this.multipleIndex - this.getHalfScreenElsCount()
      if (this.startIndex < 0) {
        this.startIndex = 0
        this.multipleIndex = this.startIndex + this.getHalfScreenElsCount()
      }
      if (!this.displayedElsCount) {
        this.displayedElsCount =
          this.oneScreenElsCount + this.halfScreenElsCount * 2
      }
      if (this.startIndex + this.displayedElsCount > this.total) {
        this.startIndex = this.total - this.displayedElsCount - 1
        this.multipleIndex = this.startIndex + this.getHalfScreenElsCount()
      }
      setTimeout(() => {
        this.formCollection().then(() => {
          new Promise((resolve) => {
            this.waitShiftResolver = resolve
          }).then(() => {
            // TODO: Проверить причины прыжка
            this.calculateHalfSize()
            this.shiftLayout()
          })
        })
      }, 0)
    },
    getHalfScreenElsCount() {
      if (!this.halfScreenElsCount) {
        this.halfScreenElsCount =
          Math.floor(
            this.getScreenSize() / (this.averageItemSize + this.gap) / 2
          ) * this.grid
      }
      return this.halfScreenElsCount
    },
    getRange() {
      if (this.firstOccur) {
        return [this.index, this.index + this.min]
      }
      return [this.startIndex, this.startIndex + this.displayedElsCount]
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
        if (uniqKey >= start && uniqKey < end) {
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
