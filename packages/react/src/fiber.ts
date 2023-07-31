import type { FiberNode, VirtualElement } from './type'
import { createDOM, updateAttributes } from './createDom'

// 下一个要处理的fiber节点
let nextUnitOfWork: FiberNode | null = null
// 上一次渲染的 fiber 树
let currentRoot: FiberNode | null = null
// 当前渲染的 fiber 树
let workInProgressRoot: FiberNode<any> | null = null
// 当前渲染函数组件的filer节点
let wipFiber: FiberNode<any> | null = null
// hooks 索引
let hookIndex = 0
// 用于记录删除的节点
let deletions: FiberNode[] = []

export function useState<S>(initState: S): [S, (value: S) => void] {
  const fiberNode: FiberNode<S> = wipFiber!
  const hook: {
    state: S
    queue: S[]
  } = fiberNode?.alternate?.hooks
    ? fiberNode.alternate.hooks[hookIndex]
    : {
        state: initState,
        queue: [],
      }

  while (hook.queue.length) {
    const newState = hook.queue.shift()
    hook.state = newState!
  }

  if (typeof fiberNode?.hooks === 'undefined')
    fiberNode.hooks = []

  fiberNode.hooks.push(hook)
  hookIndex += 1

  const setState = (value: S) => {
    hook.queue.push(value)
    if (currentRoot) {
      workInProgressRoot = {
        type: currentRoot.type,
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
      }
      nextUnitOfWork = workInProgressRoot
      deletions = []
      currentRoot = null
    }
  }

  return [hook.state, setState]
}

// 创建fiber根目录，render函数调用
export function createRootFiberNode(element: VirtualElement, container: Element) {
  currentRoot = null
  workInProgressRoot = {
    type: 'div',
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  nextUnitOfWork = workInProgressRoot
}

function performUnitOfWork(fiberNode: FiberNode): FiberNode | null {
  const type = fiberNode.type
  if (typeof type === 'function') {
    // 函数组件hook处理
    wipFiber = fiberNode
    wipFiber.hooks = []
    hookIndex = 0
    const children = [type(fiberNode.props)]

    reconcileChildren(fiberNode, children)
  }
  else if (!type || typeof type === 'string' || typeof type === 'number') {
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
  if (!elements || !elements.length)
    return
  // 二维转一维，方便处理
  elements = elements.flat()
  if (!elements.length)
    return
  let index = 0
  let preFiber: FiberNode | null = null
  let oldFiberNode: FiberNode | null = null
  if (fiberNode.alternate?.child)
    oldFiberNode = fiberNode.alternate.child

  while (index < elements.length || oldFiberNode) {
    const curElement = elements[index]
    let newFiber: FiberNode | null = null
    let child: VirtualElement
    if (typeof curElement === 'string')
      child = createTextElement(curElement)

    else child = curElement

    const isSameType = Boolean(
      oldFiberNode
        && child
        && oldFiberNode.type === child.type,
    )
    if (oldFiberNode && isSameType) {
      newFiber = {
        type: oldFiberNode.type,
        dom: oldFiberNode.dom,
        alternate: oldFiberNode,
        props: child.props,
        return: fiberNode,
        flag: 'UPDATE',
      }
    }
    if (child && !isSameType) {
      newFiber = {
        type: child.type,
        alternate: null,
        dom: null,
        flag: 'Placement',
        props: child.props,
        return: fiberNode,
      }
    }
    if (!isSameType && oldFiberNode)
      deletions.push(oldFiberNode)

    if (oldFiberNode)
      oldFiberNode = oldFiberNode.sibling || null

    if (!preFiber && newFiber)
      fiberNode.child = newFiber!
    else if (preFiber)
      preFiber!.sibling = newFiber!

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
          case 'UPDATE':
            updateAttributes(
              fiberNode.dom,
              fiberNode.props,
              fiberNode.alternate ? fiberNode.alternate.props : {},
            )
            break
          default:
            break
        }
      }

      commitWork(fiberNode.child)
      commitWork(fiberNode.sibling)
    }
  }

  for (const deletion of deletions) {
    if (deletion.dom) {
      const parentFiber = findParentFiber(deletion)
      parentFiber?.dom?.removeChild(deletion.dom)
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
