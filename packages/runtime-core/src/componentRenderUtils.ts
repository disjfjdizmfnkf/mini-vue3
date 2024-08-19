import { createVNode, Text } from './vnode'
import { ShapeFlags } from '../../shared/src/shapeFlags'


export function renderComponentRoot(instance: any) {
  const { vnode, render, data } = instance

  let result

  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render!.call(data))
    }
  } catch (error) {
    console.error(error)
  }

  return result
}

/**
 * 确保所有子节点都是VNode结构
 */
export function normalizeVNode(child: any) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

/**
 * clone VNode
 */
export function cloneIfMounted(child: any) {
  return child
}
