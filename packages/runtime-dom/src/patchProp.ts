import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'

/**
 * Props除了定义组件时在父组件中传递的属性外，还包括class、style、事件处理器、自定义的函数v-等
 * @param el
 * @param key
 * @param prevValue
 * @param nextValue
 */
export function patchProp(el: Element, key: string, prevValue: any, nextValue: any) {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    // patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    // patchEvent(el, key.slice(2).toLowerCase(), prevValue as EventListener, nextValue as EventListener)
  } else {
    // patchAttr(el, key, nextValue)
  }
}