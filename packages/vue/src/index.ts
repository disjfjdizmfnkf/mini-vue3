export * from '@vue/reactivity'
export * from '@vue/runtime-core'
export * from '@vue/runtime-dom'
// 这里的compile返回的是一个有AST和render函数的对象
// export { compile } from '@vue/compiler-dom'

// 包裹后的compile函数，直接返回可执行的render函数
export * from '@vue/vue-compat'

export * from '@vue/shared'