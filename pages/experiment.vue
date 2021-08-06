<template lang="pug">
  div(ref="container")
    div(ref="viewport")
      slot(name="viewport", :collection="collection")
        slot(name="item", v-for="({ item, realIndex }, index) in collection")
</template>

<script>
export default {
  name: 'Experiment',
  props: {
    data: {
      type: Array,
      default() {
        return []
      },
    },
    index: {
      type: Number,
      default() {
        return 0
      },
    },
    target: {
      type: Function,
      default(ctx) {
        return ctx.$refs.container
      },
    },
  },
  data() {
    return {
      collection: [],
      cache: {},
      viewportState: {
        // Размеры отображаемой области
        height: 0,
        width: 0,
        left: 0,
        top: 0,
      },
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.target(this).addEventListener('scroll', this.onScrollHandler)
    },
    onAddElements() {
      //
    },
    onRemoveElements() {
      //
    },
    onChangeCollection() {
      //
    },
    renderCollection() {
      //
      this.onChangeCollection()
    },
    scrollToElement(index) {
      //
    },
    detectScrollStart() {
      //
    },
    detectScrollEnd() {
      //
    },
    detectState() {
      //
    },
    correctPosition() {
      //
    },
    onScrollHandler() {
      //
    },
  },
}
</script>

<style lang="stylus" scoped>
//
</style>
