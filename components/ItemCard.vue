<template lang="pug">
  .item-card(:style="{ padding: `${identify ? 10 : item.random}px`, height: identify ? '110px' : 'auto' }")
    .item-card__title
      | {{ currentItem.label }}
    .item-card__content
      | {{ currentItem.label }}
</template>

<script>
export default {
  name: 'ItemCard',
  props: {
    item: {
      type: [Object, Promise],
      default: null,
    },
  },
  data() {
    return {
      identify: true,
      currentItem: {
        title: '',
        label: '',
      },
    }
  },
  watch: {
    item: {
      immediate: true,
      handler(value) {
        if (value instanceof Promise) {
          value.then((promiseResult) => {
            this.currentItem = promiseResult
          })
        } else {
          this.currentItem = value
        }
      },
    },
  },
}
</script>

<style lang="stylus">
.item-card
  //padding 10px
  background-color #6d7b8e
  color #FFF
  box-sizing border-box
  font-size 12px
  &__title
    padding 0 10px
    font-size 14px
  &__content
    margin-top 10px
</style>
