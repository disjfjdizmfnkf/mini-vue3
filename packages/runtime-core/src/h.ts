import { VNode, createVNode, isVNode } from './vnode'
import { isArray, isObject } from '@vue/shared'

/**
 * 判断参数类型，创建VNode
 * @param type 组件类型或组件名
 * @param propsOrChildren 属性对象或子节点
 * @param children 子节点
 */
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length

  // 参数长度为2，判断第二个参数的类型
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      } else {
        return createVNode(type, propsOrChildren, null)
      }
    } else {
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // 将第二个参数之后的参数拆分为一个数组
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}