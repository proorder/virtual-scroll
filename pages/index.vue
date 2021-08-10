<template lang="pug">
  .container
    virtual-scroll(
      :total="total",
      :collection="items",
      :classes="['page-items-list']",
      :grid="3",
      :gap="10",
      scroll-selector="document",
      @view="onChangeView"
    )
      template(#item="item")
        item-card(:item="item")
</template>

<script>
import VirtualScroll from '~/components/VirtualScroll'
import ItemCard from '~/components/ItemCard'

export default {
  name: 'MainPage',
  components: {
    VirtualScroll,
    ItemCard,
  },
  data() {
    return {
      loadedPagesHistory: [],
      page: 1,
      total: null,
      limit: 14,
      items: [],
      paginationHandler: null,
    }
  },
  methods: {
    fetch(page) {
      return new Promise((resolve) => {
        const url = `http://localhost:3332/resources/?limit=14&page=${page}&query=&filter=%2Fgroups%2Fid+eq+%228aeba98c-f944-401b-b25d-45e9ebaf5015%22&sortBy=name&sortDir=asc&display=model&values=`
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
      // index начинается с 0, а количество отображаемых элементов с 1
      const leftPage = Math.ceil((startIndex + 1) / 14)
      const rightPage = Math.ceil((endIndex + 1) / 14)
      const pages = []
      for (let i = leftPage; i <= rightPage; i++) {
        if (this.loadedPagesHistory.includes(i)) {
          continue
        }
        pages.push(i)
      }
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
            item.random = Math.random() * 20
            collection.push(item)
          })
        })
        this.items = [...this.items, ...collection].sort(
          (a, b) => a.index - b.index
        )
        this.total = total
      })
    },
  },
}
</script>

<style lang="stylus">
body
  background-color #e7e7e7 // #414141
// #35495e
.container
  margin 0 auto
  width 800px
  height 100vh
.page-items-list
  display grid
  align-items stretch
  grid-template-columns repeat(3, 1fr)
  grid-template-rows none
  grid-auto-rows max-content
  grid-column-gap 10px
  grid-row-gap 10px
</style>
