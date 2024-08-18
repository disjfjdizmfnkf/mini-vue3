import { createVNode, Text } from './vnode'

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
