import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import OptionItem from '~/components/OptionItem.vue'

describe('OptionItem – gating av lösningsfärg', () => {
  it('färgar inte utan showSolution', () => {
    const w = mount(OptionItem, {
      props: {
        option: { id: 'a', text: 'A' },
        selected: true,
        isCorrect: false,
        showSolution: false
      }
    })
    const el = w.get('div.inline-block')
    expect(el.classes()).not.toContain('ring-rose-500')
    expect(el.classes()).not.toContain('ring-emerald-500')
  })

  it('färgar korrekt alternativ när showSolution=true', () => {
    const w = mount(OptionItem, {
      props: {
        option: { id: 'a', text: 'A' },
        selected: false,
        isCorrect: true,
        showSolution: true
      }
    })
    expect(w.get('div.inline-block').classes()).toContain('ring-emerald-500')
  })

  it('färgar valt felaktigt alternativ när showSolution=true', () => {
    const w = mount(OptionItem, {
      props: {
        option: { id: 'b', text: 'B' },
        selected: true,
        isCorrect: false,
        showSolution: true
      }
    })
    expect(w.get('div.inline-block').classes()).toContain('ring-rose-500')
  })
})

describe('OptionItem – färgning gate:ad på showSolution', () => {
    it('färgar inte utan showSolution', () => {
      const w = mount(OptionItem, { props: { option:{id:'a',text:'A'}, selected:true, isCorrect:false, showSolution:false } })
      const el = w.get('div.inline-block')
      expect(el.classes()).not.toContain('ring-emerald-500')
      expect(el.classes()).not.toContain('ring-rose-500')
    })
    it('grön ring för korrekt när showSolution=true', () => {
      const w = mount(OptionItem, { props: { option:{id:'a',text:'A'}, selected:false, isCorrect:true, showSolution:true } })
      expect(w.get('div.inline-block').classes()).toContain('ring-emerald-500')
    })
    it('röd ring för valt fel när showSolution=true', () => {
      const w = mount(OptionItem, { props: { option:{id:'b',text:'B'}, selected:true, isCorrect:false, showSolution:true } })
      expect(w.get('div.inline-block').classes()).toContain('ring-rose-500')
    })
  })
