const doc = document

/**
 * 用于在浏览器环境中操作 DOM 的一些方法
 */
export const nodeOps = {
  insert: (child: any, parent: any, anchor = null) => {
    parent.insertBefore(child, anchor)
  },
  createElement: (tag: string): Element => doc.createElement(tag),
  setElementText: (el: Element, text: string) => {
    el.textContent = text
  },
}