<template lang="pug">
  .container
    scroll-container(
      :indexes="indexes",
      :total="total",
      :collection="items",
      :classes="['page-items-list']",
      scroll-selector="document",
      @loadPage="onLoadPage"
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
import { pageToIndexes } from '~/components/helpers/calculateElementsScope'

function generatePage(page) {
  return itemsList.map((item, index) => {
    const newItem = { ...item }
    newItem.id = uuid()
    newItem.title = `${item.title} Page ${page}`
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
      return pageToIndexes(this.page, this.limit, this.total)
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
  methods: {
    async onLoadPage(page) {
      const promise = new Promise((resolve) => {
        resolve(generatePage(page))
      })
      this.pushItemsToCollection(await promise)
    },
    pushItemsToCollection(items) {
      this.items.push(...items)
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
  grid-template-columns repeat(4, 1fr)
  grid-column-gap 10px
  grid-row-gap 10px
</style>
