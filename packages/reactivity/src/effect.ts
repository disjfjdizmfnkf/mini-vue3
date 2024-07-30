import { createDeep, Dep } from './dep'
import { isArray } from '@vue/shared'
import { ComputedRefImpl } from './computed'

export type EffectScheduler = (...args: any) => any

const targetMap = new WeakMap<any, Map<any, Dep>>()

/**
 * 封装副作用函数/依赖收集/依赖触发
 * @param fn 副作用函数
 */
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined

/**
 * 封装副作用函数，方便控制和触发副作用函数
 */
export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>

  constructor(
      public fn: () => T,
      public scheduler: EffectScheduler | null = null
    ) {}

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

  // target->(key)Map: key->effect set
  let deepsMap = targetMap.get(target)
  if (!deepsMap) {
    deepsMap = new Map<any, Dep>
    // targetMap[target] = depsMap 键被垃圾回收时，属性赋值操作可能会导致无法预料的行为
    targetMap.set(target, deepsMap)
  }
  // key->(Reactive)Set
  let deep = deepsMap.get(key)
  // 当前key属性没有activeEffects集合
  if (!deep) {
    deep = createDeep()
    deepsMap.set(key, deep)
  }

  trackEffects(deep)
}

/**
 * 跟踪key的所有effects
 * @param dep key的effects集合
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}


/**
 * 依赖触发函数
 * @param target
 * @param key
 * @param newValue
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  const deepsMap = targetMap.get(target)
  if (!deepsMap) return

  const deep = deepsMap.get(key)
  if (!deep) return

  triggerEffects(deep)
}

/**
 * 依次触发dep中的依赖
 * @param dep
 */
export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]
  for (const item of effects) {
    triggerEffect(item)
  }
}

/**
 * 触发指定依赖
 * @param effect
 */
export function triggerEffect(effect: ReactiveEffect){
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}
