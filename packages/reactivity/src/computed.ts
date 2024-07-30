import { isFunction } from '@vue/shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl<T>{
  public dep?: Dep = undefined
  private _value!: T
  public _dirty = true
  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true


  /*
   *  getter中的响应式数据会将this.effect收集为依赖
   */
  constructor(getter: any) {
    this.effect = new ReactiveEffect(getter, ()=>{
      if (!this._dirty){
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  /**
   * 脏位为真时: 收集依赖 触发effect
   */
  get value() {
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
}

export function computed(getterOrOptions: any) {
  let getter
  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef
}