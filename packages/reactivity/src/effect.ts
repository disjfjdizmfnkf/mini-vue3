const targetMap = new WeakMap<any, Map<any, Set<ReactiveEffect>>>()

/**
 * 封装副作用函数/依赖收集/依赖触发
 * @param fn 副作用函数
 */
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {
  }

  run() {
    activeEffect = this

    return this.fn()
  }
}


/**
 * 依赖收集函数
 * @param target
 * @param key
 */
export function track(target: object, key: unknown) {
  if (!activeEffect) return

  // target->(key)Map
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map<any, Set<ReactiveEffect>>
    // targetMap[target] = depsMap 键被垃圾回收时，属性赋值操作可能会导致无法预料的行为
    targetMap.set(target, depsMap)
  }
  // key->(Reactive)Set
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set<ReactiveEffect>()
    depsMap.set(key, dep)
  }
  dep.add(activeEffect)

  console.log(targetMap)
}


/**
 * 依赖触发函数
 * @param target
 * @param key
 * @param newValue
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  console.log('触发依赖')
}