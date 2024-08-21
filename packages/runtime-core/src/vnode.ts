import { isArray, isFunction, isObject, isString } from '@vue/shared'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { normalizeClass, normalizeStyle } from '../../shared/src/normalizeProp'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: true
  el: any
  type: any
  props: any
  children: any
  shapeFlag: ShapeFlags
  key: any
}

export function createVNode(type: any, props: any, children: any): VNode {
  // class, style 增强
  if (props) {
    // class增强
    let { class: klass, style } = props
    // string类型是常规class类型
    if (klass && !isString(klass)) {
      normalizeClass(klass)
    }

    // style增强
    if (style && (isObject(style) || isArray(style))) {
      props.style = normalizeStyle(style)
    }
  }

  // 获取dom节点类型
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT
    : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT
      : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type: any, props: any, children: any, shapeFlags: ShapeFlags | number): VNode {
  const vnode: VNode = {
    __v_isVNode: true,
    el: null,
    type,
    props,
    children,
    shapeFlag: shapeFlags,
    key: props?.key || null
  }
  normalizeChildren(vnode, children)
  return vnode
}

function normalizeChildren(vnode: VNode, children: any) {
  let type = 0

  // const { shapeFlag } = vnode

  if (children == null) {
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    // 融合子节点类型
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  // 按位或运算符将type的标志位合并到vnode.shapeFlags中，最终包括VNode的类型例如元素节点、
  // 函数组件、有状态组件等）以及其子节点的类型（例如文本子节点、数组子节点、插槽子节点等）
  vnode.shapeFlag |= type
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode : false
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}