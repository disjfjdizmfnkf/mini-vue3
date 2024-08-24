import { ElementTypes, NodeTypes } from './ast'


const enum TagType {
  Start,
  End
}


export interface ParserContext {
  source: string
}

/**
 * 将content转换为parserContext，content内容  context语境
 * @param content 原始模板字符串
 */
function createParserContext(content: string): ParserContext {
  return {
    // 解析模板内容到parserContext的属性中
    source: content,
  }
}

/**
 * 生成root节点，将children挂载到root节点的children上
 * @param children
 */
export function createRoot(children: any[]) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc: {}
  }
}

// 将content转换为ast
export function baseParse(content: string) {
  // 包含content模板字符串及其解析状态对象
  const context = createParserContext(content)

  const children = parserChildren(context, [])

  return createRoot(children)
}


/**
 * 解析context中前面的el的子节点（可能有也可能没有子节点）
 * 递归地处理子节点 确保所有节点都被正确解析
 * @param context
 * @param ancestors
 */
function parserChildren(context: ParserContext, ancestors: any[]) {
  const nodes = <any>[]

  // 解析各种node节点(token)，之后会将其加入栈中
  while (!isEnd(context, ancestors)) {
    const s = context.source

    let node
    if (startsWith(s, '{{')) {
      // TODO: 解析插值表达式 {{
    } else if (s[0] === '<') {
      // TODO: 一个标签的开始
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

    return nodes
  }
}

function pushNode(nodes: any[], node: any) {
  if (node) {
    nodes.push(node)
  }
}

/**
 * 解析Element,包括开始标签和结束标签
 * @param context
 * @param ancestors
 */
function parseElement(context: ParserContext, ancestors: any[]) {
  // -- 先处理开始标签 --
  const element = parseTag(context, TagType.Start)

  //  使用ancestor存储当前节点,传入parseChildren中作为父节点
  ancestors.push(element)
  // parseChildren中会再次调用parseElement，递归解析el的子节点
  const children = parserChildren(context, ancestors)
  ancestors.pop()
  // 为子节点赋值
  element.children = children

  //  判断这个el的结束标签
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

  const tag = match[1]

  // 对模板进行解析处理
  advanceBy(context, match[0].length)

  // 属性与指令处理
  // advanceSpaces(context)
  // let props = parseAttributes(context, type)

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
 * 判断当前标签是否是一个匹配父标签的结束标签，可以应对标签中含有子标签的情况
 *
 * 简单来说，是判断栈中的一个标签（和它的子标签）是否结束
 * @param context
 * @param ancestors 存储所遇到的所有父级节点的数组
 */
function isEnd(context: ParserContext, ancestors: any[]) {
  const s = context.source

  // 遇到一个结束标签
  if (startsWith(s, '</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      // 这个结束标签和当前的父标签匹配
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }
  return !s
}

/**
 * 判断当前是否为《标签结束的开始》。比如 </div> 就是 div 标签结束的开始
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

function startsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString)
}
