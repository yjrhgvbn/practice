import { createRootFiberNode } from './fiber'

type ComponentChild = any
export function render(vNode: ComponentChild, element: HTMLElement) {
  createRootFiberNode(vNode, element)
}

export function renderDom(vNode: ComponentChild): Node | null {
  let dom: DocumentFragment | Text | HTMLElement | null = null
  if (!vNode)
    return null

  if (typeof vNode === 'string') {
    dom = document.createTextNode(vNode)
    return dom
  }

  if (typeof vNode === 'number') {
    dom = document.createTextNode(vNode.toString())
    return dom
  }

  if (Array.isArray(vNode)) {
    dom = document.createDocumentFragment()
    for (const item of vNode) {
      const child = renderDom(item)
      if (child)
        dom.appendChild(child)
    }
    return dom
  }
  if (vNode?.type) {
    dom = document.createElement(vNode?.type)
    return dom
  }

  return document.createElement('div')
}
