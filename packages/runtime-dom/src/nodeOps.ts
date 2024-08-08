const doc = document

/**
 * 用于在浏览器环境中操作 DOM 的一些方法
 */
export const nodeOps = {
  insert: (child: any, parent: any, anchor = null) => {
    parent.insertBefore(child, anchor)
  },
  remove: (child: any) => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  createElement: (tag: any) => doc.createElement(tag),
  createText: (text: string) => doc.createTextNode(text),
  createComment: (text: string) => doc.createComment(text),
  setText: (node: { nodeValue: any }, text: any) => {
    node.nodeValue = text
  },
  setElementText: (el: { textContent: any }, text: any) => {
    el.textContent = text
  },
  parentNode: (node: { parentNode: any }) => node.parentNode,
  nextSibling: (node: { nextSibling: any }) => node.nextSibling,
  querySelector: (selector: any) => doc.querySelector(selector)
}