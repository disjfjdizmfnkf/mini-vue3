import { baseParse } from './parse'
import { extend } from '@vue/shared'
import { transformElement } from './transforms/transformElement'
import { transformText } from './transforms/transformText'
import { transform } from './transform'
import { generate } from './codegen'

/**
 *
 * @param template
 * @param options
 */
export function baseCompiler(template: string, options = {}) {
  const ast = baseParse(template)

  console.log(JSON.stringify(ast))

  transform(ast, extend(options, {
    nodeTransforms: [transformElement, transformText],
  }))

  // JSON.stringify(ast) 会将ast对象转换为字符串 (函数 循环引用 Symbol)会转化为空
  console.log(ast)

  return generate(ast)
}