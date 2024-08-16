import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchAttr } from './modules/attrs'
import { patchStyle } from './modules/style'

/**
 * Props除了定义组件时在父组件中传递的属性外，还包括class、style、事件处理器、自定义的函数v-等
 * @param el
 * @param key
 * @param prevValue
 * @param nextValue
 */
export const patchProp = (el: Element, key: string, prevValue: any, nextValue: any) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    // patchEvent(el, key.slice(2).toLowerCase(), prevValue as EventListener, nextValue as EventListener)
  } else if (shouldSetAsProp(el, key)) {
    patchDOMProp(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}


/**
 * 判断指定元素的指定属性是否可以通过 DOM Properties 指定,这种方式更高效
 */
function shouldSetAsProp(el: Element, key: string) {
  // 各种边缘情况处理
  if (key === 'spellcheck' || key === 'draggable' || key === 'translate') {
    return false
  }

  // 表单元素的表单属性是只读的，必须设置为属性 attribute
  if (key === 'form') {
    return false
  }

  // <input list> 必须设置为属性 attribute
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }

  // <textarea type> 必须设置为属性 attribute
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }

  return key in el
}