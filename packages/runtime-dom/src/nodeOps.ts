const doc = document

/**
 * 用于在浏览器环境中操作 DOM 的一些方法
 */
export const nodeOps = {
  insert: (child: Element, parent: Element, anchor: Element | null = null) => {
    parent.insertBefore(child, anchor)
  },
  createElement: (tag: string): Element => doc.createElement(tag),
  setElementText: (el: Element, text: string) => {
    el.textContent = text
  },
  remove: (child: Element) => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  }
}