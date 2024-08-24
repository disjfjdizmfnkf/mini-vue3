import { baseParse } from './parse'

/**
 *
 * @param template
 * @param options
 */
export function baseCompiler(template: string, options = {}) {
  const ast = baseParse(template)
  console.log(JSON.stringify(ast))
  return {}
}