import { createRenderer, RendererOptions } from '../../runtime-core/src/renderer'
import { extend } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer: any

function ensureRenderer() {
  return renderer || (renderer = createRenderer(<RendererOptions>rendererOptions))
}

export const render = (...args: any[]) => {
  ensureRenderer().render(...args)
}