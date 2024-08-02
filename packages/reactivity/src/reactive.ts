import { mutableHandlers } from './baseHandlers'
import { isObject } from '@vue/shared'

const reactiveMap = new WeakMap<object, any>

// 这里使用枚举类型是为了防止硬编码
export const enum reactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

/**
 * 返回一个代理对象
 * @param target 被代理对象
 * @returns 代理对象
 */
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

/**
 *
 * @param target
 * @param baseHandlers
 * @param proxyMap  使用弱引用和映射 优化内存和重复代理
 */

function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>,
) {
  const existingProxy = proxyMap.get(target)

  if (existingProxy) {
    return existingProxy
  }

  // 如果target不存在代理对象，创建代理对象，
  const proxy = new Proxy(target, baseHandlers)  // target: 被代理对象  baseHandlers: 捕获器
  // 利用哈希表缓存对象
  proxyMap.set(target, proxy)
  // 标识为reactive对象
  proxy[reactiveFlags.IS_REACTIVE] = true
  return proxy
}


/**
 * value是对象? reactive(value) : value
 * 如果传入的值是对象就使用reactive进行响应性处理 不是直接返回
 * @param value
 */
export const toReactive = <T extends unknown>(value: T): T =>
  isObject(value) ? reactive(value as object) : value


export function isReactive(value: any): boolean {
  return !!(value && value[reactiveFlags.IS_REACTIVE])
}