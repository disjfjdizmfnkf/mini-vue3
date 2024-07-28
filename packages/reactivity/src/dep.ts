import { ReactiveEffect } from './effect'

// key/属性 的reactive函数集合
export type Dep = Set<ReactiveEffect>


export const createDeep = (effects?: ReactiveEffect[]): Dep => {
  return new Set<ReactiveEffect>(effects)  // effects必须是可迭代对象，或者不传入参数，不能只是一个item
}