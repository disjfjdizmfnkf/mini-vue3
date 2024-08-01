export const isArray = Array.isArray
export const isObject = (val: unknown) => val !== null && typeof val === 'object'
export const hasChanged = (newVal: any, oldVal: any): boolean => !Object.is(newVal, oldVal)
export const isFunction = (val: unknown) => typeof val === 'function'
export const extend = Object.assign