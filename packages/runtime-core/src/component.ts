import { VNode } from './vnode'
import { isFunction, isObject } from '@vue/shared'
import { reactive } from '@vue/reactivity'
import { onBeforeMount, onMounted } from './apiLifecycle'

let uid = 0

/**
 * 生命周期钩子
 */
export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm'
}


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
    // 生命周期相关
    isMounted: false, // 是否挂载
    bc: null, // beforeCreate
    c: null, // created
    bm: null, // beforeMount
    m: null, // mounted
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
  const Component = instance.type
  // 判断是setupAPI还是compositionAPI
  const { setup } = Component
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)
  }
}

export function handleSetupResult(instance: any, setupResult: any) {
  // 存在 setupResult，并且它是一个函数，则 setupResult 就是需要渲染的 render
  if (isFunction(setupResult)) {
    instance.render = setupResult
  }
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  const Component = instance.type

  // 组件不存在 render 时，才需要重新赋值
  if (!instance.render) {
    // 存在编辑器，并且组件中不包含 render 函数，同时包含 template 模板，则直接使用编辑器进行编辑，得到 render 函数
    if (compile && !Component.render) {
      if (Component.template) {
        // 这里就是 runtime 模块和 compile 模块结合点
        const template = Component.template
        Component.render = compile(template)
      }
    }
    // 为 render 赋值
    instance.render = Component.render
  }

  // 改变 options 中的 this 指向
  applyOptions(instance)
}

/**
 * 规范化组件实例数据
 * 注册 hooks
 * @param instance
 */
function applyOptions(instance: any) {
  const {
    data: dataOptions,
    // 创建相关hook
    beforeCreate,
    created,
    // 挂载相关hook
    beforeMount,
    mounted,
  } = instance.type

  // 创建的前的hooks，解构出beforeCreate之后直接通过callHook调用
  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  if (dataOptions) {
    // 触发 dataOptions 函数，拿到 data 对象
    const data = dataOptions()
    if (isObject(data)) {
      // 将data转换为proxy
      instance.data = reactive(data)
    }
  }

  // 创建后的hooks，解构出created之后直接通过callHook调用
  if (created) {
    callHook(created, instance.data)
  }

  function registerLifecycleHook(register: Function, hook?: Function) {
    register(hook?.bind(instance.data), instance)
  }

  // 注册与挂载相关的hooks  也就是将hook函数挂载到组件实例中(bm, m), 之后在挂载时(render)调用
  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

/**
 * 触发 hooks
 */
function callHook(hook: Function, proxy: any) {
  // 使用bind改变this指向，以使得在与create相关的hook中可以使用响应式对象
  hook.bind(proxy)()
}

/**
 * 编辑器实例
 */
let compile

/**
 * 用来注册编译器的运行时
 */
export function registerRuntimeCompiler(_compile: any) {
  compile = _compile
}