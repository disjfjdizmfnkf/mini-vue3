import { createDeep, Dep } from './dep'
import { extend, isArray } from '@vue/shared'
import { ComputedRefImpl } from './computed'

export type EffectScheduler = (...args: any) => any

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

const targetMap = new WeakMap<any, Map<any, Dep>>()

/**
 * 封装副作用函数/依赖收集/依赖触发/处理options参数
 * @param fn 副作用函数
 * @param options lazy和scheduler
 */
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)

  // 试图在ReactiveEffect中创建options中的调度器属性
  if (options) {
    extend(_effect, options)
  }

  if (!options || !options.lazy) {
    _effect.run()
  }
}

export let activeEffect: ReactiveEffect | undefined

/**
 * 封装副作用函数并绑定到全局activeEffect，方便对副作用函数操作和触发
 */
export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null,
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
  // for (const item of effects) {
  //   triggerEffect(item)
  // }

  // 先执行计算属性的effect，之后会执行调度函数触发依赖，再执行依赖触发，中间没有computed的依赖执行（effect函数）
  // 而改变脏位导致无线循环
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }

  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

/**
 * 触发指定依赖
 * @param effect
 */
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}
