import ScrollFacade from './ScrollFacade'
import ScrollHandler from './ScrollHandler'
import LayoutHandler from './LayoutHandler'
import CollectionHandler from './CollectionHandler'

let handleScroll = null

export default {
  name: 'ScrollContainer',
  props: {
    startIndex: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 4,
    },
    indexes: {
      type: Array,
      default: () => [null, null],
    },
    total: {
      type: Number,
      default: 0,
    },
    scrollSelector: {
      type: [String, Object],
      default: null,
    },
    collection: {
      type: Array,
      default: () => [],
    },
    isTable: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: Array,
      default: () => [],
    },
    ScrollHandlerClass: {
      type: Function,
      default: ScrollHandler,
    },
    LayoutHandlerClass: {
      type: Function,
      default: LayoutHandler,
    },
    CollectionHandlerClass: {
      type: Function,
      default: CollectionHandler,
    },
  },
  data() {
    return {
      collectionHandler: null,
      displayCollectionPromises: [],
      displayCollection: [],
      scrollElement: null,
      scrollFacade: null,
      layoutSize: null,
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(value) {
        if (!process.client) {
          return
        }
        if (this.scrollFacade) {
          this.fillCollection(value)
          return
        }
        this.$nextTick(() => {
          this.initScrollFacade()
          this.fillCollection(value)
        })
      },
    },
  },
  beforeDestroy() {
    this.scrollElement.removeEventListener('scroll', handleScroll)
  },
  methods: {
    requireElements(startIndex, endIndex) {
      this.$emit('load', [startIndex, endIndex])
    },
    fillCollection(collection, startIndex = this.startIndex) {
      const {
        displayCollection,
        missingElementIndex,
        endMissingElementIndex,
      } = this.getDisplayCollection(collection, startIndex)
      if (missingElementIndex) {
        this.requireElements(missingElementIndex, endMissingElementIndex)
      }
      this.$set(this, 'displayCollection', displayCollection)
      this.scrollFacade
        .initMutationObserver()
        .then(({ layoutSize, displayedElementsCount }) => {
          if (layoutSize) {
            this.setLayoutSize(layoutSize)
          }
          if (displayedElementsCount && displayedElementsCount > this.min) {
            this.fillCollection(collection, startIndex)
          }
        })
    },
    getDisplayCollection(collection, startIndex) {
      return this.scrollFacade.getDisplayCollection({
        collection,
        indexes: this.indexes,
        total: this.total,
        minDisplayCollection: this.min,
        startIndex,
      })
    },
    setLayoutSize(layoutSize) {
      this.layoutSize = layoutSize
    },
    initScrollFacade() {
      this.setupScrollElement()
      const layoutHandler = new this.LayoutHandlerClass({
        scrollElement: this.scrollElement,
        layoutElement: this.$refs.transmitter,
      })
      const scrollHandler = new this.ScrollHandlerClass({
        layoutHandler,
        scrollElement: this.scrollElement,
      })
      this.collectionHandler = new this.CollectionHandlerClass({
        layoutHandler,
      })
      this.scrollFacade = new ScrollFacade({
        scrollHandler,
        collectionHandler: this.collectionHandler,
        layoutHandler,
      })
      this.scrollFacade.setCollectionExtender(this.collectionExtender)

      handleScroll = this.scrollFacade.handleScroll.bind(this.scrollFacade)
      this.scrollElement.addEventListener('scroll', handleScroll)
    },
    collectionExtender(startIndex = this.startIndex /*, amount */) {
      this.fillCollection(this.collection, startIndex)
    },
    setupScrollElement() {
      this.scrollElement = this.scrollSelector
        ? this.scrollSelector === 'document'
          ? window
          : document.querySelector(this.scrollSelector)
        : document.documentElement || document.body
    },
  },
  render(h) {
    return h(
      'div',
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
            ref: 'transmitter',
          },
          [
            this.$scopedSlots.default &&
              this.$scopedSlots.default({
                displayCollectionPromises: this.isTable /* || notMeasuring */
                  ? this.displayCollectionPromises
                  : [],
                displayCollection: this.displayCollection,
              }),
          ]
        ),
      ]
    )
  },
}
