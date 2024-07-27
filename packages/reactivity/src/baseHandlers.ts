import { track, trigger } from './effect'

const get = creatGetter()
const set = creatSetter()


function creatGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    // 进行依赖收集
    track(target, key)

    return res
  }
}

function creatSetter() {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const result = Reflect.set(target, key, value, receiver)

    // 触发依赖
    trigger(target, key, value)

    return result
  }
}

// 拦截和自定义对象的基本操作
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}