<template lang="pug">
  .container
    virtual-scroll(
      :total="total",
      :collection="items",
      :classes="['page-items-list']",
      :grid="3",
      scroll-selector="document",
      @view="onChangeView"
    )
      template(#default="{ displayCollection }")
        item-card(
          v-for="(item, index) in displayCollection",
          :key="index",
          :item="item"
        )
</template>

<script>
import { v4 as uuid } from 'uuid'
import itemsList from '~/assets/server-response.json'

function generatePage(page) {
  return itemsList.map((item, index) => {
    const newItem = { ...item }
    newItem.id = uuid()
    newItem.title = `${item.title} Page ${page}`
    newItem.index = itemsList.length * (page - 1) + index
    return newItem
  })
}

export default {
  name: 'MainPage',
  data() {
    return {
      loadedPagesHistory: [1],
      page: 1,
      total: 500,
      limit: 14,
      lastPage: Math.ceil(500 / 14),
      items: generatePage(1),
      paginationHandler: null,
    }
  },
  computed: {
    indexes() {
      return [0, this.items.length - 1]
    },
  },
  watch: {
    page(value) {
      if (this.loadedPagesHistory.includes(value)) {
        return
      }
      this.loadedPagesHistory = [...this.loadedPagesHistory, value].sort()
    },
  },
  // created() {
  //   generatePage(1).forEach((item) => {
  //     this.items[item.index] = item
  //   })
  // },
  methods: {
    onChangeView([startIndex, endIndex]) {
      const page = Math.ceil(endIndex / itemsList.length)
      const lastLoadedPages = this.loadedPagesHistory[
        this.loadedPagesHistory.length - 1
      ]
      const pages = Array.from(
        { length: page - lastLoadedPages },
        (i, k) => k + 1 + lastLoadedPages
      )
      pages
        .filter((p) => !this.loadedPagesHistory.includes(p))
        .forEach((page) => {
          // generatePage(page).forEach((item) => {
          //   this.items[item.index] = item
          // })
          this.pushItemsToCollection(generatePage(page))
        })
      this.loadedPagesHistory = [...this.loadedPagesHistory, ...pages].sort(
        (a, b) => a - b
      )
      // this.$set(this, 'items', this.items)
    },
    onLoad(startIndex, endIndex) {
      const load = () => {
        this.page = this.page + 1
        this.pushItemsToCollection(generatePage(this.page))
        if (this.items.length - 1 < endIndex) {
          load()
        }
      }
      load()
    },
    // async onLoadPage(page) {
    //   const promise = new Promise((resolve) => {
    //     resolve(generatePage(page))
    //   })
    //   this.pushItemsToCollection(await promise)
    // },
    pushItemsToCollection(items) {
      items.forEach((item) => {
        this.items.push(item)
      })
    },
  },
}
</script>

<style lang="stylus">
body
  background-color #e7e7e7
// #35495e
.container
  margin 0 auto
  width 800px
  height 100vh
.page-items-list
  display grid
  grid-template-columns repeat(3, 1fr)
  grid-column-gap 10px
  grid-row-gap 10px
</style>
