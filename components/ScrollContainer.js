import ScrollFacade from './ScrollFacade'
import ScrollHandler from './ScrollHandler'
import LayoutHandler from './LayoutHandler'
import CollectionHandler from './CollectionHandler'

export default {
  name: 'ScrollContainer',
  props: {
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
      displayCollectionPromises: [],
      displayCollection: [],
      scrollElement: null,
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(value) {
        if (!process.client) {
          return
        }
        if (!this.scrollFacade) {
          this.initScrollFacade()
        }
        const { displayCollection } = this.scrollFacade.getDisplayCollection(
          value
        )
        this.displayCollection = displayCollection
        this.$nextTick(() => {
          this.scrollFacade.computeLayoutSize()
        })
      },
    },
  },
  methods: {
    initScrollFacade() {
      this.setupScrollElement()
      const scrollHandler = new this.ScrollHandlerClass()
      const layoutHandler = new this.LayoutHandlerClass({
        scrollElement: this.scrollElement,
        layoutElement: this.$refs.transmitter,
      })
      const collectionHandler = new this.CollectionHandlerClass({
        layoutHandler,
      })
      this.scrollFacade = new ScrollFacade({
        scrollHandler,
        collectionHandler,
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
