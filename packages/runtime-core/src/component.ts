import { VNode } from './vnode'
import { isObject } from '@vue/shared'
import { reactive } from '@vue/reactivity'

let uid = 0

export function createComponentInstance(vnode: VNode) {
  const type = vnode.type
  return {
    uid: uid++,  // 唯一标记
    vnode, // 虚拟节点
    type, // 组件类型
    subTree: null, // render 函数的返回值
    effect: null, // ReactiveEffect 实例
    update: null, // update 函数，触发 effect.run
    render: null, // 组件内的 render 函数
  }
}

/**
 * 规范化组件实例数据
 */
export function setupComponent(instance: any) {
  // 为 render 赋值
  return setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance: any) {
  const Component = instance.type

  instance.render = Component.render

  // 改变 options 中的 this 指向
  applyOptions(instance)
}

function applyOptions(instance: any) {
  const { data: dataOptions } = instance.type

  if (dataOptions){
    const data = dataOptions()
    if (isObject(data)) {
      // 将data转换为proxy
      instance.data = reactive(data)
    }
  }
}