import ScrollFacade from './ScrollFacade'
import ScrollHandler from './ScrollHandler'
import LayoutHandler from './LayoutHandler'
import CollectionHandler from './CollectionHandler'

export default {
  name: 'ScrollContainer',
  props: {
    page: {
      type: Number,
      default: 1,
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
        this.displayCollection = value
        this.$nextTick(() => {
          this.initScrollFacade()
          this.fillCollection(value)
        })
      },
    },
  },
  methods: {
    fillCollection(collection) {
      const { displayCollection } = this.scrollFacade.getDisplayCollection({
        collection,
        page: this.page,
      })
      this.displayCollection = displayCollection
      setTimeout(() => {
        const { layoutSize } = this.scrollFacade.computeLayoutSize()
        if (layoutSize) {
          this.setLayoutSize(layoutSize)
        }
      }, 20)
    },
    setLayoutSize(layoutSize) {
      this.layoutSize = layoutSize
    },
    initScrollFacade() {
      this.setupScrollElement()
      const scrollHandler = new this.ScrollHandlerClass()
      const layoutHandler = new this.LayoutHandlerClass({
        scrollElement: this.scrollElement,
        layoutElement: this.$refs.transmitter,
      })
      this.collectionHandler = new this.CollectionHandlerClass({
        layoutHandler,
      })
      this.scrollFacade = new ScrollFacade({
        scrollHandler,
        collectionHandler: this.collectionHandler,
        layoutHandler,
      })
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
