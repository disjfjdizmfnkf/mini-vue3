import { baseCompiler } from '../../compiler-core/src/compile'

export function compile(template: string, options = {}){
  return baseCompiler(template, options)
}