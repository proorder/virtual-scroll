<template lang="pug">
  .container
    virtual-scroll(
      :total="total",
      :collection="items",
      :classes="['page-items-list']",
      scroll-selector="document",
      @view="onChangeView"
    )
</template>

<script>
import VirtualScroll from '~/components/VirtualScroll'

export default {
  name: 'MainPage',
  components: {
    VirtualScroll,
  },
  data() {
    return {
      loadedPagesHistory: [],
      page: 1,
      total: null,
      limit: 14,
      items: [], // generatePage(1),
      paginationHandler: null,
    }
  },
  methods: {
    onChangeView([startIndex, endIndex]) {},
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
