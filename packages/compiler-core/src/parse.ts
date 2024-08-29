import { ElementTypes, NodeTypes } from './ast'

/**
 * 解析器上下文
 */
export interface ParserContext {
  // 模板数据源
  source: string
}

/**
 * 将content转换为parserContext，content内容  context语境
 * @param content 原始模板字符串
 */
const enum TagType {
  Start,
  End
}

/**
 * 生成 root 节点
 */
export function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
    // loc：位置，这个属性并不影响渲染，但是它必须存在，否则会报错。所以我们给了他一个 {}
    loc: {},
  }
}

/**
 * 基础的 parse 方法，生成 AST
 * @param content tempalte 模板
 * @returns
 */
export function baseParse(content: string) {
  // 包含content模板字符串及其解析状态对象
  const context = createParserContext(content)
  const children = parseChildren(context, [])
  return createRoot(children)
}

/**
 * 创建解析器上下文
 */
function createParserContext(content: string): ParserContext {
  // 合成 context 上下文对象
  return {
    source: content,
  }
}

/**
 * 解析context中前面的el的子节点（可能有也可能没有子节点）
 * 递归地处理子节点 确保所有节点都被正确解析
 * @param context
 * @param ancestors
 */
function parseChildren(context: ParserContext, ancestors: any[]) {
  const nodes = <any>[]

  // 解析各种node节点(token)，之后会将其加入栈中
  while (!isEnd(context, ancestors)) {
    /**
     * 模板源
     */
    const s = context.source
    // 定义 node 节点
    let node

    if (startsWith(s, '{{')) {
      node = parseInterpolation(context)
    }
    // 一个标签的开始
    else if (s[0] === '<') {
      // 以 < 开始，后面跟a-z 表示，这是一个标签的开始
      if (/[a-z]/i.test(s[1])) {
        // 处理各种Element,
        node = parseElement(context, ancestors)
      }
    }

    // 如果此时node还没有被赋值，那么说明这个node是文本节点
    if (!node) {
      node = parseText(context)
    }

    pushNode(nodes, node)
  }

  return nodes
}

/**
 * 解析插值表达式 {{ xxx }}
 */
function parseInterpolation(context: ParserContext) {
  // open = {{
  // close = }}
  const [open, close] = ['{{', '}}']

  advanceBy(context, open.length)

  // 获取插值表达式中间的值
  const closeIndex = context.source.indexOf(close, open.length)
  const preTrimContent = parseTextData(context, closeIndex)
  const content = preTrimContent.trim()

  advanceBy(context, close.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content,
    },
  }
}

/**
 * 判断是否为结束节点
 */
function isEnd(context: ParserContext, ancestors): boolean {
  const s = context.source

  // 解析是否为结束标签
  if (startsWith(s, '</')) {
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }
  return !s
}

/**
 * 解析 Element 元素。例如：<div>
 */
function parseElement(context: ParserContext, ancestors) {
  // -- 先处理开始标签 --
  const element = parseTag(context, TagType.Start)

  //  -- 处理子节点 --
  ancestors.push(element)
  // 递归触发 parseChildren
  const children = parseChildren(context, ancestors)
  ancestors.pop()
  // 为子节点赋值
  element.children = children

  //  -- 最后处理结束标签 --
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  }

  // 整个标签处理完成
  return element
}

/**
 * 解析标签
 */
function parseTag(context: any, type: TagType): any {
  // 获取标签名
  const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)
  // 标签名字
  const tag = match[1]

  // 对模板进行解析处理
  advanceBy(context, match[0].length)

  // 属性与指令处理
  advanceSpaces(context)
  let props = parseAttributes(context, type)

  // 处理标签结束部分(自闭合标签和非自闭合标签)
  // 判断是否为自闭合标签，例如 <img /> 注意此时游标已经移动了
  let isSelfClosing = startsWith(context.source, '/>')
  // 继续对模板进行解析处理，是自动标签则处理两个字符 /> ，不是则处理一个字符 >
  advanceBy(context, isSelfClosing ? 2 : 1)

  // 标签类型
  let tagType = ElementTypes.ELEMENT

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    // 属性与指令
    props: [],
  }
}

/**
 * 解析属性与指令
 */
function parseAttributes(context, type) {
  // 解析之后的 props 数组
  const props: any = []
  // 属性名数组
  const attributeNames = new Set<string>()

  // 循环解析，直到解析到标签结束（'>' || '/>'）为止
  while (
    context.source.length > 0 &&
    !startsWith(context.source, '>') &&
    !startsWith(context.source, '/>')
    ) {
    // 具体某一条属性的处理
    const attr = parseAttribute(context, attributeNames)
    // 添加属性
    if (type === TagType.Start) {
      props.push(attr)
    }
    advanceSpaces(context)
  }
  return props
}

/**
 * 处理指定指令，返回指令节点
 */
function parseAttribute(context: ParserContext, nameSet: Set<string>) {
  // 获取属性名称。例如：v-if
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!
  const name = match[0]
  // 添加当前的处理属性
  nameSet.add(name)

  advanceBy(context, name.length)

  // 获取属性值。
  let value: any = undefined

  // 解析模板，并拿到对应的属性值节点
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpaces(context)
    advanceBy(context, 1)
    advanceSpaces(context)
    value = parseAttributeValue(context)
  }

  // 针对 v- 的指令处理
  if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
    // 获取指令名称
    const match =
      /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
        name,
      )!

    // 指令名。v-if 则获取 if
    let dirName = match[1]
    // TODO：指令参数  v-bind:arg
    // let arg: any

    // TODO：指令修饰符  v-on:click.modifiers
    // const modifiers = match[3] ? match[3].slice(1).split('.') : []

    return {
      type: NodeTypes.DIRECTIVE,
      name: dirName,
      exp: value && {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        isStatic: false,
        loc: value.loc,
      },
      arg: undefined,
      modifiers: undefined,
      loc: {},
    }
  }

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value.content,
      loc: value.loc,
    },
    loc: {},
  }
}

/**
 * 获取属性（attr）的 value
 */
function parseAttributeValue(context: ParserContext) {
  let content = ''

  // 判断是单引号还是双引号
  const quote = context.source[0]
  const isQuoted = quote === `"` || quote === `'`
  // 引号处理
  if (isQuoted) {
    advanceBy(context, 1)
    // 获取结束的 index
    const endIndex = context.source.indexOf(quote)
    // 获取指令的值。例如：v-if="isShow"，则值为 isShow
    if (endIndex === -1) {
      content = parseTextData(context, context.source.length)
    } else {
      content = parseTextData(context, endIndex)
      advanceBy(context, 1)
    }
  }

  return { content, isQuoted, loc: {} }
}

/**
 * 解析文本。
 */
function parseText(context: ParserContext) {
  // 普通文本的结束标记
  const endTokens = ['<', '{{']
  // 计算普通文本结束的位置
  let endIndex = context.source.length

  // 计算精准的 endIndex，计算的逻辑为：从 context.source 中分别获取 '<', '{{' 的下标，取最小值为 endIndex
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  // 获取处理的文本内容
  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

/**
 * 是否以指定文本开头
 */
function startsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString)
}

/**
 * 将text切割出来并返回，移动游标
 */
function parseTextData(context: ParserContext, length: number): string {
  // 获取text
  const rawText = context.source.slice(0, length)
  // 移动游标
  advanceBy(context, length)

  return rawText
}

/**
 * 前进非固定步数
 */
function advanceSpaces(context: ParserContext): void {
  const match = /^[\t\r\n\f ]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

/**
 * 移动游标到下一个解析位置 | 帮助有限状态机移动到下一个开始状态
 * @param context  解析上下文
 * @param numberOfCharacters 要去除的字符数
 */
function advanceBy(context: ParserContext, numberOfCharacters: number): void {
  // template 模板源
  const { source } = context
  // 去除开始部分的无效数据
  context.source = source.slice(numberOfCharacters)
}

/**
 * nodes.push(node)
 */
function pushNode(nodes, node): void {
  nodes.push(node)
}

/**
 * 判断当前是否为《标签结束的开始》		。比如 </div> 就是 div 标签结束的开始
 * @param source 模板。例如：</div>
 * @param tag 标签。例如：div
 * @returns
 */
function startsWithEndTagOpen(source: string, tag: string): boolean {
  return (
    startsWith(source, '</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
    /[\t\r\n\f />]/.test(source[2 + tag.length] || '>')
  )
}
