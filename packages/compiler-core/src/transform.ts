import { NodeTypes } from './ast'
import { isArray } from '@vue/shared'
import { TO_DISPLAY_STRING } from './runtimeHelpers'
import { isSingleElementRoot } from './hoistStatic'

/**
 * transform 上下文对象
 */
export interface TransformContext {
  /**
   * AST 根节点
   */
  root: any
  /**
   * 每次转化时记录的父节点
   */
  parent: ParentNode | null
  /**
   * 每次转化时记录的子节点索引
   */
  childIndex: number
  /**
   * 当前处理的节点
   */
  currentNode: any
  /**
   * 协助创建 JavaScript AST 属性 helpers，用于记录 render 函数中创建节点的方法
   * 值为 Symbol(方法名) 表示 render 函数中创建 节点 的方法
   */
  helpers: Map<symbol, number>

  helper<T extends symbol>(name: T): T

  /**
   * 转化方法集合
   */
  nodeTransforms: any[]

  /**
   * 替换节点
   */
  replaceNode(node): void
}


function createTransformContext(root: any, { nodeTransforms = [] }) {
  const context: TransformContext = {
    // options
    nodeTransforms,

    // state
    root,
    helpers: new Map(),
    currentNode: root,
    parent: null,
    childIndex: 0,

    // methods
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    replaceNode(node) {
      context.parent!.children[context.childIndex] = context.currentNode = node
    },
  }
  return context
}


/**
 * 遍历转化节点，转化的过程一定要是深度优先的（即：孙 -> 子 -> 父），因为当前节点的状态往往需要根据子节点的情况来确定。
 * 转化的过程分为两个阶段：
 * 1. 进入阶段：存储所有节点的转化函数到 exitFns 中
 * 2. 退出阶段：执行 exitFns 中缓  存的转化函数，且一定是倒叙的。因为只有这样才能保证整个处理过程是深度优先的
 */
/**
 * 根据 AST 生成 JavaScript AST
 * @param root AST
 * @param options 配置对象
 */
export function transform(root, options) {
  // 创建 transform 上下文
  const context = createTransformContext(root, options)
  // 按照深度优先依次处理 node 节点转化
  traverseNode(root, context)
  createRootCodegen(root)
  root.helpers = [...context.helpers.keys()]  // 解构出所有创建节点的方法
  root.components = []
  root.directives = []
  root.imports = []
  root.hoists = []
  root.temps = []
  root.cached = []
}


/**
 * 深度优先+遍历 转化节点
 * (在搜索过程中收集transform方法，最后从深到浅调用transform方法实现节点从深到钱转化)
 * @param node
 * @param context
 */
export function traverseNode(node: any, context: TransformContext) {
  context.currentNode = node
  // 获取当前所有 node 节点的 transform 方法
  const { nodeTransforms } = context
  // 存储转化函数的数组
  const exitFns: any = []
  // 循环获取节点的 transform 方法，缓存到 exitFns 中
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      // 指令的 transforms 返回为 数组，所以需要解构
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      } else {
        exitFns.push(onExit)
      }
    }
    // 因为触发了 replaceNode，可能会导致 context.currentNode 发生变化，所以需要在这里校正
    if (!context.currentNode) {
      // 节点已删除
      return
    } else {
      // 节点更换
      node = context.currentNode
    }
  }

  // 继续转化子节点
  switch (node.type) {
    case NodeTypes.IF_BRANCH:
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
    // 插值表达式 {{}}
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    // v-if 指令处理
    case NodeTypes.IF:
      for (let i = 0; i < node.branches.length; i++) {
        traverseNode(node.branches[i], context)
      }
      break
  }

  // 经过上面的处理之后，现在的node是一个分支上最深的节点
  context.currentNode = node
  // 从后往前执行transform方法即是从深到浅
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

/**
 * 对每个子节点调用traverseNode递归地转化子节点
 * @param parent
 * @param context
 */
export function traverseChildren(parent: any, context: TransformContext) {
  parent.children.forEach((node: any, index: any) => {
    context.parent = parent
    context.childIndex = index
    traverseNode(node, context)
  })
}


function createRootCodegen(root: any) {
  const { children } = root

  // 仅支持单个的根节点
  if (children.length === 1) {
    const child = children[0]
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      //当根节点只有一个子节点时，这个子节点的 codegenNode 会直接作为根节点的
      // codegenNode，不需要额外的提升或处理。
      root.codegenNode = child.codegenNode
    }
  }
}