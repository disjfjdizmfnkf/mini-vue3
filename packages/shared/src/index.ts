export const isArray = Array.isArray
export const isObject = (val: unknown) => val !== null && typeof val === 'object'
export const hasChanged = (newVal: any, oldVal: any): boolean => !Object.is(newVal, oldVal)
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const extend = Object.assign
export const EMPTY_OBJ: { readonly [key: string]: any } = {}
// export const isOn = (key: string) => key[0] === 'o' && key[1] === 'n'  有缺陷
export const isOn = (key: string) => /^on[^a-z]/.test(key)  // 判断是否是事件绑定