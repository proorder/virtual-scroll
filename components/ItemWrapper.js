export default {
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    uniqKey: {
      type: [String, Number],
    },
    isHorizontal: {
      type: Boolean,
      default: false,
    },
  },
  created() {
    this.shapeKey = this.isHorizontal ? 'offsetWidth' : 'offsetHeight'
  },
  mounted() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.$emit(
          'resize',
          this.uniqKey.toString().slice(-2) === '_q'
            ? this.uniqKey.toString().slice(0, -2)
            : this.uniqKey,
          this.$el ? this.$el[this.shapeKey] : 0
        )
      })
      this.resizeObserver.observe(this.$el)
    }
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },
  render() {
    return (this.$scopedSlots.default && this.$scopedSlots.default()) || null
    // return h(
    //   this.tag,
    //   {
    //     key: this.uniqKey,
    //   },
    //   [
    //     h(this.component, {
    //       props: {
    //         ...this.extraProps,
    //       },
    //       scopedSlots: this.$scopedSlots,
    //     }),
    //   ]
    // )
  },
}
