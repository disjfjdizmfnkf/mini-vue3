import { createRenderer } from '../../runtime-core/src/renderer'
import { extend } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = extend({ patchProp }, nodeOps)

let render

function ensureRenderer() {
  return render || (render = createRenderer(rendererOptions))
}

export const render = (...args) => {
  ensureRenderer().render(...args)
}