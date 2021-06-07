import ScrollFacade from './ScrollFacade'
import ScrollHandler from './ScrollHandler'
import LayoutHandler from './LayoutHandler'
import CollectionHandler from './CollectionHandler'

export default {
  name: 'VirtualScroll',
  props: {
    grid: {
      type: Number,
      default: 0,
    },
    index: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 4,
    },
    collection: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    scrollSelector: {
      type: [String, Object],
      default: null,
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
      displayCollectionPromises: [],
      displayCollection: [],
      scrollElement: null,
      collectionHandler: null,
      scrollHandler: null,
      scrollFacade: null,
      layoutSize: null,
      layoutShift: 0,
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(collection) {
        if (!process.client) {
          return
        }
        if (this.scrollFacade) {
          this.scrollFacade.setCollection(this.buildContext(collection))
          return
        }
        this.$nextTick(() => {
          this.initScrollFacade()
          this.scrollFacade.setCollection(this.buildContext(collection))
        })
      },
    },
  },
  beforeDestroy() {
    this.scrollFacade.destroyScroll()
  },
  methods: {
    buildContext(collection = this.collection) {
      return {
        collection,
        total: this.total,
        minDisplayCollection: this.min,
        index: this.index,
      }
    },
    setDisplayCollection({ displayCollection }) {
      this.$set(this, 'displayCollection', displayCollection)
      if (!displayCollection.length) {
        return
      }
      this.$emit('view', [
        displayCollection[0].index,
        displayCollection[displayCollection.length - 1].index,
      ])
    },
    setLayoutSize(layoutSize) {
      this.layoutSize = layoutSize
    },
    setLayoutShift(size) {
      this.layoutShift = size
    },
    initScrollFacade() {
      this.setupScrollElement()
      const {
        scrollHandler,
        collectionHandler,
        layoutHandler,
      } = this.initScrollHandlers()
      this.scrollFacade = new ScrollFacade({
        scrollHandler,
        collectionHandler,
        layoutHandler,
        setDisplayCollection: this.setDisplayCollection,
        grid: this.grid,
      })
      this.scrollFacade.initScroll()
    },
    initScrollHandlers() {
      const layoutHandler = new this.LayoutHandlerClass({
        scrollElement: this.scrollElement,
        layoutElement: this.$refs.transmitter,
        setLayoutShift: this.setLayoutShift,
        setLayoutSize: this.setLayoutSize,
      })
      this.scrollHandler = new this.ScrollHandlerClass({
        layoutHandler,
        scrollElement: this.scrollElement,
      })
      this.collectionHandler = new this.CollectionHandlerClass({
        layoutHandler,
      })
      return {
        scrollHandler: this.scrollHandler,
        collectionHandler: this.collectionHandler,
        layoutHandler,
      }
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
            style: {
              position: 'relative',
              top: `${this.layoutShift}px`,
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
