import { mutableHandlers } from './baseHandlers'

const reactiveMap = new WeakMap<object, any>


/**
 * 返回一个代理对象
 * @param target 被代理对象
 * @returns 代理对象
 */
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap);
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
  proxyMap: WeakMap<object, any>
) {
  const existingProxy = proxyMap.get(target)

  if (existingProxy) {
    return existingProxy
  }

  // 如果该对象不存在proxy对象
  const proxy = new Proxy(target, baseHandlers)
  // 利用哈希表缓存对象
  proxyMap.set(target, proxy)

  return proxy
}