<template lang="pug">
  .container
    virtual-scroll(
      v-if="total",
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

// eslint-disable-next-line no-unused-vars
function generatePage(page) {
  return itemsList.map((item, index) => {
    const newItem = { ...item }
    newItem.id = uuid()
    newItem.title = `${item.title} Page ${page}`
    newItem.index = itemsList.length * (page - 1) + index
    newItem.random = Math.round(Math.random() * 15)
    return newItem
  })
}

export default {
  name: 'MainPage',
  data() {
    return {
      loadedPagesHistory: [1],
      page: 1,
      total: null,
      limit: 14,
      items: [], // generatePage(1),
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
  created() {
    this.fetch(1).then(({ total }) => {
      this.total = total
    })
  },
  methods: {
    fetch(page) {
      return new Promise((resolve) => {
        const url = `http://localhost:3332/resources/?limit=14&page=${page}&query=&filter=%2Fgroups%2Fid+eq+%228aeba98c-f944-401b-b25d-45e9ebaf5015%22&sortBy=updatedAt&sortDir=asc&display=model&values=`
        fetch(url)
          .then((r) => r.json())
          .then((response) => {
            resolve(response)
          })
      })
    },
    onChangeView([startIndex, endIndex]) {
      if (
        this.items.find((i) => i.index === startIndex) &&
        this.items.find((i) => i.index === endIndex)
      ) {
        return
      }
      const leftPage = Math.ceil(startIndex / 14)
      const rightPage = Math.ceil(endIndex / 14)
      const pages = []
      for (let i = leftPage; i <= rightPage; i++) {
        if (this.loadedPagesHistory.includes(i)) {
          continue
        }
        pages.push(i)
      }
      console.log(pages)
      const promises = pages.map((page) => {
        return this.fetch(page)
      })
      this.loadedPagesHistory = [...this.loadedPagesHistory, ...pages].sort()
      Promise.all(promises).then((results) => {
        let total = null
        const collection = []
        results.forEach(({ data, page, total: lastTotal, perPage }) => {
          total = lastTotal
          data.forEach((item, index) => {
            item.index = perPage * (page - 1) + index
            collection.push(item)
          })
        })
        this.items = [...this.items, ...collection].sort(
          (a, b) => a.index - b.index
        )
        console.log(this.items)
        this.total = total
      })
    },
    pushItemsToCollection(items, page) {
      items.forEach((item, index) => {
        item.index = 14 * (page - 1) + index
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
