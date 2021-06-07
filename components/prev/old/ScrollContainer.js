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
    page: {
      type: [Number, Array],
      default: null,
    },
    total: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 0,
    },
    collection: {
      type: Array,
      default: () => [],
    },
    layoutOffset: {
      type: Number,
      default: 0,
    },
    defaultLayoutSize: {
      type: Number,
      default: 0,
    },
    isHorizontal: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: Array,
      default: () => [],
    },
    layoutHandlerClass: {
      type: Function,
      default: LayoutHandler,
    },
    collectionHandlerClass: {
      type: Function,
      default: CollectionHandler,
    },
    itemKeyField: {
      type: String,
      default: 'id',
    },
  },
  data() {
    return {
      firstDisplay: false,
      scrollElement: null,
      scrollHandler: null,
      layoutHandler: null,
      layoutSize: this.defaultLayoutSize,
      collectionHandler: null,
      currentCollection: [],
      receivedPages: [],
      updatesStack: [],
      shadowCollection: {},
      // ---------------------- //
      //    Slot attributes:    //
      // ---------------------- //
      displayCollection: [],
      displayCollectionPromises: [],
      groupByKeyMap: new Map(),
      // ---------------------- //
      //  End slot attributes;  //
      // ---------------------- //
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(value) {
        if (!process.client || !value) {
          return
        }
        switch (true) {
          case !this.currentCollection.length:
            this.receivedPages.push(this.page)
            this.currentCollection = value.map((item) => {
              item._page = this.page
              return item
            })
            break
          default:
            if (this.currentCollection.length < value.length) {
              const incomingItems = value
                .filter(
                  (i) =>
                    !this.currentCollection
                      .map((ic) => ic[this.itemKeyField])
                      .includes(i[this.itemKeyField])
                )
                .map((item) => {
                  item._page = this.updatesStack[0]
                  return item
                })
              this.currentCollection.push(...incomingItems)
              this.updateStack(true)
            } else if (this.currentCollection.length > value.length) {
              // Осуществить проверку на сокращение коллекции
              // Пройти по загруженным страницам и понять удален ли один элемент или не осталось ни одного из страницы
            } else {
              this.$emit('loadPage', this.updatesStack[0])
            }
        }
        // TODO: Решить задачу с total === 0 вне nuxt
        if (!this.collectionHandler) {
          // eslint-disable-next-line new-cap
          this.collectionHandler = new this.collectionHandlerClass({
            collection: this.currentCollection,
            total: this.total,
            limit: this.limit,
            callLoadPages: this.loadPages,
            updateDisplayCollection: this.collectItemToDisplay,
          })
        } else {
          this.collectionHandler.update(this.currentCollection)
        }
      },
    },
  },
  mounted() {
    this.initialize()

    this.firstDisplay = true
    this.formDisplayCollection(true)

    // Первая итерация.
    // Последовательность:
    // - Формирование коллекции промисов для первой страницы.
    // - Получение оценки
  },
  methods: {
    initialize() {
      this.scrollElement = this.scrollSelector
        ? this.scrollSelector === 'document'
          ? document
          : document.querySelector(this.scrollSelector)
        : document.documentElement || document.body

      // eslint-disable-next-line new-cap
      this.layoutHandler = new this.layoutHandlerClass({
        offset: this.layoutOffset,
        element: this.$refs.transmitter || undefined,
      })

      this.scrollHandler = new ScrollHandler(
        {
          element: this.scrollElement,
          page: this.page,
        },
        this.layoutHandlerClass
      )

      this.scrollElement.addEventListener(
        'scroll',
        this.scrollHandler.handleScroll
      )
    },
    formDisplayCollection(firstDisplay = false) {
      this.displayCollectionPromises = this.collectionHandler.getPromises({
        page: this.page,
        firstDisplay,
        pages: this.layoutHandler.getCountOfPagesOnScreen(),
      })
      this.groupByKeyMap = this.collectionHandler.getAccordingCollectionGroupsMap()
    },
    collectItemToDisplay(page, item) {
      if (this.shadowCollection[page]) {
        this.shadowCollection[page].push(item)
        // Коллекция страницы готова к отображению
        if (this.shadowCollection[page].length === this.limit) {
          if (this.receivedPages[0] > page) {
            // Добавить вначало
            this.shadowCollection[page].reverse().forEach((i) => {
              this.displayCollection.unshift(i)
            })
          } else {
            // Добавить в конец
            this.shadowCollection[page].forEach((i) => {
              this.displayCollection.push(i)
            })
          }
          delete this.shadowCollection[page]
        }
      } else {
        this.shadowCollection[page] = [item]
      }
    },
    prepareLayout() {
      // this.layoutHandler
    },
    updateStack(request = false) {
      this.receivedPages.push(this.updatesStack.shift())
      if (this.updatesStack[0] && request) {
        this.$emit('loadPage', this.updatesStack[0])
      }
    },
    loadPages(pages) {
      const stack = Boolean(this.updatesStack.length)
      this.updatesStack.push(
        ...pages
          .filter((p) => !this.receivedPages.includes(p))
          .sort((a, b) => a - b)
      )
      if (!stack) {
        this.$emit('loadPage', this.updatesStack[0])
      }
    },
    // ---------------------- //
    //    Slot attributes:    //
    // ---------------------- //
    resolveRowAttributes(index) {
      return {
        // Returns the group:
        'pagination-info': this.groupByKeyMap.get(index),
      }
    },
    // ---------------------- //
    //  End slot attributes;  //
    // ---------------------- //
  },
  render(h) {
    if (process.client) {
      if (this.firstDisplay) {
        this.$nextTick(() => {
          if (this.$refs.transmitter.children.length > 0) {
            this.firstDisplay = false

            // CollectionHandler formed one page collection
            this.layoutHandler.estimateCollection()
            // TODO: Оценить происходит ли гонка и не происходит ли layoutShift
            this.layoutSize = this.layoutHandler.prepareLayoutSize(
              this.scrollHandler.getParentContainerSize()
            )
            this.formDisplayCollection()
          }
        })
      }
    }
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
                // Вместо displayCollection можно использовать displayCollectionPromises,
                // если используются карточки одинаковых размеров или строки таблиц.
                displayCollectionPromises: this.displayCollection,
                groupByKeyMap: this.groupByKeyMap,
                resolveRowAttributes: this.resolveRowAttributes,
              }),
          ]
        ),
      ]
    )
  },
}
