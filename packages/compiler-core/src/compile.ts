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

  transform(ast, extend(options, {
    nodeTransforms: [transformElement, transformText],
  }))
  console.log(ast)

  console.log(JSON.stringify(ast))
  return generate(ast)
}