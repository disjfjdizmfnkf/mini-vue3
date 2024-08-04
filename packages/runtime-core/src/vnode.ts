import { isArray, isFunction, isString } from '@vue/shared'
import { ShapeFlags } from '../../shared/src/shapeFlags'

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlags: ShapeFlags | number
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode : false
}

function normalizeChildren(vnode: VNode, children: any) {
  let type = 0

  const { shapeFlags } = vnode
  if (children === null) {
  } else if (isArray(children)) {
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  // 按位或运算符将type的标志位合并到vnode.shapeFlags中
  vnode.shapeFlags |= type
}

function createBaseVNode(type: any, props: any, children: any, shapeFlags: ShapeFlags | number): VNode {
  const vnode: VNode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlags,
  }
  normalizeChildren(vnode, children)
  return vnode
}

export function createVNode(type: any, props: any, children: any): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  return createBaseVNode(type, props, children, shapeFlag)
}