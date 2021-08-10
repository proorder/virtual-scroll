<template lang="pug">
  .item-card(:style="{ padding: `${identify ? 10 : item.random}px`, height: identify ? '110px' : 'auto' }")
    .item-card__title
      b {{ currentItem.label }}
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
      identify: false,
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
  background-color #6d7b8e // Alternative #798b8d
  color #FFF
  box-sizing border-box
  font-size 12px
  display flex
  flex-direction column
  //border-radius 8px
  &__title
    padding 0 10px
    font-size 14px
    text-align center
  &__content
    flex 1
    height 100%
    margin-top 10px
    display flex
    justify-content center
    align-items center
</style>
