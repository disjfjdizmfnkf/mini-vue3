import { ShapeFlags } from '../../shared/src/shapeFlags'
import { Comment, Text, Fragment, VNode, isSameVNodeType } from './vnode'
import { EMPTY_OBJ, isString } from '@vue/shared'
import { normalizeVNode } from './componentRenderUtils'

export interface RendererOptions {
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void

  setElementText(node: Element, text: string): void

  insert(el: Element, parent: Element, anchor?: Element): void

  createElement(type: string): Element

  remove(el: Element): void

  createText(text: string): Text

  setText(node: Element, text: string): void

  createComment(text: string): Comment
}


export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  /**
   * 解构 options，获取所有的兼容性方法
   */
  const {
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
    insert: hostInsert,
    createElement: hostCreateElement,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment,
  } = options

  // Fragment 的打补丁操作
  const processFragment = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: Element) => {
    if (!oldVNode) {
      // 如果旧的VNode不存在 逐个挂载fragment的子节点
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  // comment 的打补丁操作
  const processCommentNode = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: Element) => {
    if (oldVNode) {
      oldVNode.el = newVNode.el
    } else {
      newVNode.el = hostCreateComment(newVNode.children as string)
      hostInsert(newVNode.el, container, anchor)
    }
  }

  // Text 的打补丁操作
  const processText = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: Element) => {
    // 不存在旧的节点，则为 挂载 操作
    if (oldVNode == null) {
      // 生成节点
      newVNode.el = hostCreateText(newVNode.children as string)
      // 挂载
      hostInsert(newVNode.el, container, anchor)
    }
    // 存在旧的节点，则为 更新 操作
    else {
      const el = (newVNode.el = oldVNode.el!)
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children as string)
      }
    }
  }

  // 元素节点 Element 的打补丁操作
  const processElement = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: Element) => {
    if (!oldVNode) {
      // 挂载元素节点
      mountElement(newVNode, container, anchor)
    } else {
      // 更新元素节点
      patchElement(oldVNode, newVNode)
    }
  }


  // 挂载元素节点 1.创建 2.设置文本子节点 3.设置props 4.插入
  const mountElement = (vnode: VNode, container: Element, anchor: Element) => {
    const { type, props, shapeFlag } = vnode
    // 1.创建el
    const el = (vnode.el = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2.设置文本子节点
      hostSetElementText(el, vnode.children as string)
    }

    // 3.设置props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    // 4.插入
    hostInsert(el, container, anchor)
  }

  // 挂载子节点
  const mountChildren = (children: any, container: Element, anchor: any) => {
    // 处理 Cannot assign to read only property '0' of string 'xxx'
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  // 更新元素节点
  const patchElement = (oldVNode: VNode, newVNode: VNode) => {
    const el = (newVNode.el = oldVNode.el)
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // 更新子节点
    patchChildren(oldVNode, newVNode, el, null)

    // 更新props
    patchProps(el, newVNode, oldProps, newProps)
  }

  const patchChildren = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: any) => {
    const c1 = oldVNode && oldVNode.children
    const preShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    const c2 = newVNode && newVNode.children
    const { shapeFlag } = newVNode

    // 新子节点是文本，旧子节点1.2.   新子节点是数组，子节点1.2.
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 移除旧的子节点
        // unmountChildren(c1, container, anchor)
      }
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2 as string)
      }
    } else {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: diff
        } else {
          // TODO: 移除旧的子节点
        }
      } else {
        if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧节点的text
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 新子节点的挂载
        }
      }
    }
  }

  const patchProps = (el: Element, vNode: VNode, oldProps: any, newProps: any) => {
    if (oldProps !== newProps) {
      // 增加新的props
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        // 移除旧的props
        for (const key in oldProps) {
          if (!(key in newProps)) {

            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const patch = (oldVNode: VNode | null, newVNode: VNode, container: Element, anchor = null) => {
    if (oldVNode === newVNode) return
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null  // 为了下面调用processElement时直接执行挂载
    }

    const { type, shapeFlag } = newVNode

    switch (type) { // 根据节点类型进行不同的处理
      case Text:
        processText(oldVNode as any, newVNode, container, anchor as any)
        break
      case Comment:
        processCommentNode(oldVNode as any, newVNode, container, anchor as any)
        break
      case Fragment:
        processFragment(oldVNode as any, newVNode, container, anchor as any)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {  // 是元素节点
          processElement(oldVNode as any, newVNode, container, anchor as any)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {  // 是组件
          // processComponent(oldVNode, newVNode, container)
        }
    }
  }

  const unmount = (vnode: VNode) => {
    hostRemove(vnode.el)
  }

  const render = (vnode: VNode, container: any) => {
    // 如果 vnode 为 null，则卸载 container._vnode
    if (vnode == null) {  //新的vnode为null
      if (container._vnode) { // 且旧的vnode存在
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode  // 保存vnode,之后调用时都是旧的vnode
  }
  return {
    render,
  }

}