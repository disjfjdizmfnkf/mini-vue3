import { compile } from '@vue/compiler-dom'
import { registerRuntimeCompiler } from '../../runtime-core/src/component'

function compileToFunction(template, options?) {
  // 通过 compile 函数将模板编译成有render函数和AST的对象
  const { code } = compile(template, options)
  // code是一个返回render函数的函数字符串模板,所以这里返回的是render函数
  return new Function(code)()
}

registerRuntimeCompiler(compileToFunction)

export { compileToFunction as compile }
