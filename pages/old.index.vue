<template lang="pug">
  .container
    scroll-container(
      scroll-selector="document",
      :collection="items",
      :classes="['page-items-list']",
      :page="page",
      :total="total",
      :limit="limit",
      @loadPage="onCallLoadPage"
    )
      template(#default="{ displayCollectionPromises }")
        item-card(
          v-for="(promise, index) in displayCollectionPromises",
          :key="index",
          :item="promise"
        )
</template>

<script>
import { v4 as uuid } from 'uuid'
import itemsList from '~/assets/server-response.json'

export default {
  name: 'MainPage',
  data() {
    return {
      loadedPagesHistory: [1],
      page: 1,
      total: 500,
      limit: 14,
      lastPage: Math.ceil(140 / 14),
      items: itemsList.map((item, index) => {
        item.id = uuid()
        return item
      }),
      paginationHandler: null,
    }
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
    async onCallLoadPage(page) {
      const promise = new Promise((resolve) => {
        resolve(this.getPageCollection(page))
      })
      this.pushItemsToCollection(await promise)
    },
    pushItemsToCollection(items) {
      this.items.push(...items)
    },
    getPageCollection(page) {
      return itemsList.map((item, index) => {
        const newItem = { ...item }
        newItem.id = uuid()
        newItem.title = `${item.title} Page ${page}`
        return newItem
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
  display flex
  justify-content stretch
  align-items stretch
.page-items-list
  display grid
  grid-template-columns repeat(4, 1fr)
  grid-column-gap 10px
  grid-row-gap 10px
</style>
