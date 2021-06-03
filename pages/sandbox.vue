<template lang="pug">
.page(ref="page")
  .scroll-container(ref="scroll", :style="{ height }")
    .scroll-transmitter(ref="tr", :style="{ transform: `translateY(${top}px)` }")
      .element(v-for="item in collection", :key="item.name")
        | {{ item.name }}
</template>

<script>
import debounce from 'lodash.debounce'

const collection = Array.from({ length: 50 }, (i, k) => ({
  name: `Item: ${k}`,
}))

export default {
  data() {
    return {
      height: 'auto',
      top: 0,
      startIndex: 10,
      endIndex: 15,
      oneScreenCount: 0,
      lastScrollPosition: null,
    }
  },
  computed: {
    collection() {
      return collection.slice(this.startIndex, this.endIndex)
    },
  },
  mounted() {
    // this.height = this.$refs.scroll.offsetHeight
    const oneHeight =
      this.$refs.tr.offsetHeight / (this.endIndex - this.startIndex)
    const height = collection.length * oneHeight
    this.height = `${height}px`
    this.oneScreenCount = Math.ceil(this.$refs.page.offsetHeight / oneHeight)
    this.$nextTick(() => {
      this.$refs.page.scrollTop = this.startIndex * oneHeight
      this.top = this.startIndex * oneHeight
      const previousHeight = this.$refs.tr.offsetHeight
      this.startIndex = Math.max(0, this.startIndex - this.oneScreenCount)
      this.$nextTick(() => {
        this.top = this.top + previousHeight - this.$refs.tr.offsetHeight
        this.endIndex = Math.min(
          this.endIndex + this.oneScreenCount,
          collection.length - 1
        )
      })
    })
    this.$refs.page.addEventListener('scroll', debounce(this.onScroll, 50))
    // const els = document.querySelectorAll('.element')
    // const firstPosition = els[0].getBoundingClientRect().top
    // const lastRect = els[els.length - 1].getBoundingClientRect()
    // const height = lastRect.top + lastRect.height - firstPosition
    // console.log(height)
  },
  methods: {
    onScroll(event) {
      if (!this.lastScrollPosition) {
        this.lastScrollPosition = this.$refs.page.scrollTop
        return
      }
      const diff = this.$refs.page.scrollTop - this.lastScrollPosition
      this.lastScrollPosition = this.$refs.page.scrollTop
      if (diff >= 0) {
        this.onBottomScroll()
        return
      }
      this.onTopScroll()
    },
    onBottomScroll() {
      const previousHeight = this.$refs.tr.offsetHeight
      const previousEndIndex = this.endIndex
      this.endIndex = Math.min(
        this.endIndex + this.oneScreenCount,
        collection.length - 1
      )
      this.$nextTick(() => {
        this.top = this.top + this.$refs.tr.offsetHeight - previousHeight
        this.startIndex = this.startIndex + this.endIndex - previousEndIndex
      })
    },
    onTopScroll() {
      const previousHeight = this.$refs.tr.offsetHeight
      const scrollPosition = this.$refs.page.scrollTop
      const previousStartIndex = this.startIndex
      this.startIndex = Math.max(0, this.startIndex - this.oneScreenCount)
      this.$nextTick(() => {
        this.$refs.page.scrollTop = scrollPosition
        this.top = this.top + previousHeight - this.$refs.tr.offsetHeight
        this.endIndex = this.endIndex - (previousStartIndex - this.startIndex)
      })
    },
  },
}
</script>

<style lang="stylus">
body
  background-color #e7e7e7
  display flex
  justify-content center
  align-items center
  height 100vh
// #35495e
.page
  margin 0 auto
  width 800px
  height 50vh
  position relative
  overflow-y scroll
  &:before
    content ''
    display block
    position absolute
    top 0
    left 0
    right 0
    height 3px
    background violet
  &:after
    content ''
    display block
    position absolute
    bottom 0
    left 0
    right 0
    height 3px
    background violet
.scroll-container
  background #9ab7ff
  //display grid
  //grid-template-columns repeat(1, 1fr)
  //grid-column-gap 10px
  //grid-row-gap 10px
.element
  padding 50px
  background-color #6d7b8e
  color #FFF
  box-sizing border-box
  font-size 12px
</style>
