import { mount } from '@vue/test-utils'
import ScrollContainer from '@/components/ScrollContainer'

describe('ScrollContainer', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(ScrollContainer)
    expect(wrapper.vm).toBeTruthy()
  })
})
