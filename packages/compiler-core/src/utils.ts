import { NodeTypes } from './ast'
import { CREATE_ELEMENT_VNODE, CREATE_VNODE } from './runtimeHelpers'

export function isText(node) {
  return node.type === NodeTypes.INTERPOLATION || NodeTypes.TEXT
}

/**
 * 判断渲染方式(ssr、组件、普通元素) 返回何时的 vnode 生成函数
 */
export function getVNodeHelper(ssr: boolean, isComponent: boolean) {
  return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE
}