import type { FiberNode, VirtualElement } from './type'
import { createDOM } from './createDom'

// 下一个要处理的fiber节点
let nextUnitOfWork: FiberNode | null = null
// 上一次渲染的 fiber 树
let currentRoot: FiberNode | null = null
// 当前渲染的 fiber 树
let workInProgressRoot: FiberNode<any> | null = null

// 创建fiber根目录，render函数调用
export function createRootFiberNode(element: VirtualElement, container: Element) {
  currentRoot = null
  workInProgressRoot = {
    type: 'div',
    dom: container,
    props: {
      children: [{ ...element }],
    },
    alternate: currentRoot,
  }
  nextUnitOfWork = workInProgressRoot
}

function performUnitOfWork(fiberNode: FiberNode): FiberNode | null {
  const type = fiberNode.type
  if (typeof type === 'function') {
    const children = [type(fiberNode.props)]
    reconcileChildren(fiberNode, children)
  }
  else if (typeof type === 'string' || typeof type === 'number') {
    if (!fiberNode.dom)
      fiberNode.dom = createDOM(fiberNode)
    reconcileChildren(fiberNode, fiberNode.props.children)
    // reconcileChildren(fiber, children)
  }

  if (fiberNode.child)
    return fiberNode.child

  let nextFiberNode: FiberNode | undefined = fiberNode

  while (nextFiberNode) {
    if (nextFiberNode.sibling)
      return nextFiberNode.sibling

    nextFiberNode = nextFiberNode.return
  }

  return null
}

function reconcileChildren(fiberNode: FiberNode, elements?: (string | VirtualElement)[]) {
  if (!elements)
    return
  let index = 0
  let preFiber: FiberNode | null = null
  while (index < elements.length) {
    const curElement = elements[index]
    let child: VirtualElement
    if (typeof curElement === 'string')
      child = createTextElement(curElement)

    else
      child = curElement

    const newFiber: FiberNode = {
      type: typeof child === 'string' ? child : child.type,
      alternate: null,
      dom: null,
      flag: 'Placement',
      props: child.props,
      return: fiberNode,
    }

    if (index === 0)
      fiberNode.child = newFiber
    else
      preFiber!.sibling = newFiber

    preFiber = newFiber
    index += 1
  }
}

function commitRoot() {
  const findParentFiber = (fiberNode?: FiberNode) => {
    if (fiberNode) {
      let parentFiber = fiberNode.return
      while (parentFiber && !parentFiber.dom)
        parentFiber = parentFiber.return

      return parentFiber
    }

    return null
  }

  const commitWork = (fiberNode?: FiberNode) => {
    if (fiberNode) {
      if (fiberNode.dom) {
        const parentFiber = findParentFiber(fiberNode)
        const parentDOM = parentFiber?.dom

        switch (fiberNode.flag) {
          case 'Placement':
            parentDOM?.appendChild(fiberNode.dom)
            break
          // case 'UPDATE':
          //   updateDOM(
          //     fiberNode.dom,
          //     fiberNode.alternate ? fiberNode.alternate.props : {},
          //     fiberNode.props,
          //   )
          //   break
          default:
            break
        }
      }

      commitWork(fiberNode.child)
      commitWork(fiberNode.sibling)
    }
  }

  if (workInProgressRoot !== null) {
    commitWork(workInProgressRoot.child)
    currentRoot = workInProgressRoot
  }

  workInProgressRoot = null
}

const workLoop: IdleRequestCallback = (deadline) => {
  while (nextUnitOfWork && deadline.timeRemaining() > 1)
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)

  if (!nextUnitOfWork && workInProgressRoot)
    commitRoot()

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function createTextElement(text: string): VirtualElement {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
    },
  }
}
