import { isArray, isObject, isString } from './index'

export function normalizeClass(val: unknown): string {
  if (isString(val)) {
    return val
  } else if (isArray(val)) {
    return val.map(normalizeClass).join(' ')
  } else if (isObject(val)) {
    // Object.keys 以 string[]返回对象所有的key, 过滤掉key没有对应value的属性名
    return Object.keys(val).filter(key => (val as { [key: string]: any })[key]).join(' ')
  }
  return ''
}

export function normalizeStyle(style: any): string {
  if (isArray(style)) {
    return style.map(normalizeStyle).join('; ')
  } else if (isObject(style)) {
    return Object.keys(style).map(key => `${key}: ${(style as { [key: string]: any })[key]}`).join('; ')
  }
  return ''
}