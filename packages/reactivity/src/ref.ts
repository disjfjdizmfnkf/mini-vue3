import { createDeep, Dep } from './dep'
import { toReactive } from './reactive'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import { hasChanged } from '@vue/shared'

export interface Ref<T = any> {
  value: T
}

/**
 * reactive依赖proxy实现对象的响应式
 * 但proxy无法代理基本数据类型对其操作进行拦截，所以使用ref来处理基本数据类型
 * 所以将其包装成类 再使用reactive实现简单数据类型的响应性
 * @param value
 */
export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) return rawValue
  return new RefImpl(rawValue, shallow)
}


export class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined

  public readonly __v_isRef = true  // 用来区分这是一个包裹对象

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value  // 原始值
    this._value = __v_isShallow ? value : toReactive(value)  // 原始值或代理对象
  }


  /**
   * 依赖收集
   */
  get value() {
    trackRefValue(this)
    return this._value
  }

  /**
   * 依赖触发
   * @param newVal
   */
  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._value = toReactive(newVal)
      this._rawValue = newVal
      triggerRefValue(this)
    }
  }
}

/**
 * 依赖收集函数
 * @param ref
 */
export function trackRefValue(ref: any) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDeep()))
  }
}


/**
 * 依赖触发函数
 * @param ref
 */
export function triggerRefValue(ref: any) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

export function isRef(r: any) {
  return !!(r && r.__v_isRef)
}