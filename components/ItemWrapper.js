export default {
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    uniqKey: {
      type: String,
    },
    component: {
      type: [Object, Function],
    },
    extraProps: {
      type: Object,
      default: () => ({}),
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
          this.uniqKey,
          this.$el ? this.$el[this.shapeKey] : 0
        )
      })
      this.resizeObserver.observe(this.$el)
    }
  },
  render(h) {
    return h(
      this.tag,
      {
        key: this.uniqKey,
      },
      [
        h(this.component, {
          props: {
            ...this.extraProps,
          },
          scopedSlots: this.$scopedSlots,
        }),
      ]
    )
  },
}
