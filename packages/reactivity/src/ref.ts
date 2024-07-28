import { createDeep, Dep } from './dep'
import { toReactive } from './reactive'
import { activeEffect, trackEffects } from './effect'

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
  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._value = __v_isShallow ? value : toReactive(value)
  }


  /**
   * 返回的是一个reactive处理过的proxy对象
   */
  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {

  }
}

export function trackRefValue(ref: any) {
  if (activeEffect){
    trackEffects(ref.dep || (ref.dep = createDeep()))
  }
}

export function isRef(r: any) {
  return !!(r && r.__v_isRef)
}