import { helperNameMap } from './runtimeHelpers'
import { NodeTypes } from './ast'
import { getVNodeHelper } from './utils'
import { isArray, isString } from '@vue/shared'

// 在code中给helper函数取别名
const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

function createCodegenContext(ast) {
  const context = {
    // render 函数代码字符串
    code: ``,
    // 运行时全局的变量名
    runtimeGlobalName: 'Vue',
    // 模板源
    source: ast.loc.source,
    // 缩进级别
    indentLevel: 0,
    // 是否为服务端渲染
    isSSR: false,
    // 需要触发的方法，关联 JavaScript AST 中的 helpers
    helper(key) {
      return `_${helperNameMap[key]}`
    },
    /**
     * 插入代码
     */
    push(code) {
      context.code += code
    },
    /**
     * 新的一行
     */
    newline() {
      newline(context.indentLevel)
    },
    /**
     * 增加缩进级别;插入换行符;在新行开始时添加相应数量的缩进(空格或制表符)
     */
    indent() {
      newline(++context.indentLevel)
    },
    /**
     * 减少缩进级别;插入换行符;在新行开始时应用减少后的缩进
     */
    deindent() {
      newline(--context.indentLevel)
    },
  }

  function newline(n: number) {
    context.code += '\n' + `  `.repeat(n)
  }

  return context
}


/**
 * 根据 JavaScript AST 生成 render 函数
 */
export function generate(ast) {
  const context = createCodegenContext(ast)

  // 获取 code 拼接方法
  const { push, newline, indent, deindent } = context

  // 生成函数的前置代码：const _Vue = Vue
  genFunctionPreamble(context)

  const functionName = `render`
  const args = [`_ctx`, '_cache']
  const signature = args.join(', ')
  push(`function ${functionName}(${signature}) {`)
  indent()

  const hasHelpers = ast.helpers.length > 0
  if (hasHelpers) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = _Vue`)
    push(`\n`)
    newline()
  }

  newline()
  push(`return `)

  // 处理 renturn 后面的代码 如：_createElementVNode("div", [], [" hello world "])
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }

  deindent()
  push(`}`)

  return {
    ast,
    code: context.code,
  }
}

function genFunctionPreamble(context) {
  const { push, newline } = context
  const VueBinding = context.runtimeGlobalName
  push(`const _Vue = ${VueBinding}\n`)
  newline()
  push(`return `)
}

/**
 * 区分节点进行处理
 */
function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.IF:
      genNode(node.codegenNode!, context)
      break
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
    // // 复合表达式处理
    // case NodeTypes.SIMPLE_EXPRESSION:
    //   genExpression(node, context)
    //   break
    // // 表达式处理
    // case NodeTypes.INTERPOLATION:
    //   genInterpolation(node, context)
    //   break
    // // {{}} 处理
    // case NodeTypes.COMPOUND_EXPRESSION:
    //   genCompoundExpression(node, context)
    //   break
    // // JS调用表达式的处理
    // case NodeTypes.JS_CALL_EXPRESSION:
    //   genCallExpression(node, context)
    //   break
    // // JS条件表达式的处理
    // case NodeTypes.JS_CONDITIONAL_EXPRESSION:
    //   genConditionalExpression(node, context)
    //   break
  }
}


function genText(node, context) {
  context.push(JSON.stringify(node.content), node)
}

function genVNodeCall(node, context) {
  const { push, helper } = context
  const { tag, props, children, patchFlag, dynamicProps, isComponent } = node

  // 获取创建 vnode 的 helper 函数函数名
  const callHelper = getVNodeHelper(context.isSSR, context.isComponent)
  push(helper(callHelper) + `(`)

  // 获取存在的参数
  const args = genNullableArgs([tag, props, children, patchFlag, dynamicProps, isComponent])

  genNodeList(args, context)

  push(`)`)
}


/**
 * 去除空参数
 * @param args
 * @param context
 */
function genNullableArgs(args: any[]) {
  let i = args.length
  while (i--) {
    if (args[i] != null) break
  }
  return args.slice(0, i + 1).map(arg => arg || `null`)
}

/**
 * 处理参数的填充
 */
function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    // 字符串直接 push 即可
    if (isString(node)) {
      push(node)
    }
    // 数组需要 push "[" "]"
    else if (isArray(node)) {
      genNodeListAsArray(node, context)
    }
    // 对象需要区分 node 节点类型，递归处理
    else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNodeListAsArray(nodes, context) {
  context.push(`[`)
  genNodeList(nodes, context)
  context.push(`]`)
}