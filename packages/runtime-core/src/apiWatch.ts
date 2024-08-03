import { EMPTY_OBJ, hasChanged } from '@vue/shared'
import { isReactive } from '../../reactivity/src/reactive'
import { queuePreFlushCb } from './index'
import { ReactiveEffect } from '../../reactivity/src/effect'

export interface WatchOptions<immediate = boolean> {
  immediate?: immediate
  deep?: boolean
}


export function watch(source: any, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options)
}

/**
 *
 * @param source 响应式数据
 * @param cb 回调函数
 * @param immediate 是否立即执行
 * @param deep 是否进行深度监听
 */
export function doWatch(source: any, cb: Function, { immediate, deep }: WatchOptions = EMPTY_OBJ) {
  let getter: () => any
  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {
    }
  }

  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue = {}

  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }
  return () => {
    effect.stop()
  }
}

function traverse(value: unknown, seen = new Set<object>()): unknown {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value
  seen.add(value)
  // 使用for...in读取对象的每一个值
  for (const k in value) {
    traverse((value as Record<string, unknown>)[k], seen)
  }
  return value
}