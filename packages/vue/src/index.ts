export { reactive, effect, ref, computed } from '@vue/reactivity'
export { queuePreFlushCb, watch, h, Fragment, Text, Comment, createElementVNode } from '@vue/runtime-core'
export { render } from '@vue/runtime-dom'
// 这里的compile返回的是一个有AST和render函数的对象
// export { compile } from '@vue/compiler-dom'

// 包裹后的compile函数，直接返回可执行的render函数
export { compile } from '@vue/vue-compat'

export { toDisplayString } from '@vue/shared'