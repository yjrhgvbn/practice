import type { FiberNode, FiberNodeDOM, VirtualElementProps } from './type'

export function createDOM(fiberNode: FiberNode): FiberNodeDOM {
  const { type, props } = fiberNode
  let dom: FiberNodeDOM = null

  if (type === 'TEXT')
    dom = document.createTextNode('123')
  else if (typeof type === 'string')
    dom = document.createElement(type)

  if (dom)
    updateAttributes(dom, props)

  return dom
}
export function updateAttributes(dom: NonNullable<FiberNodeDOM>,
  nextProps: VirtualElementProps,
  prevProps: VirtualElementProps = {}) {
  for (const [removePropKey, removePropValue] of Object.entries(prevProps)) {
    if (removePropKey.startsWith('on')) {
      dom.removeEventListener(
        removePropKey.slice(2).toLowerCase(),
        removePropValue as EventListener,
      )
    }
    else if (removePropKey !== 'children') {
      // @ts-expect-error: Unreachable code error
      dom[removePropKey] = typeof attributeValue === 'object' ? {} : ''
    }
  }

  for (const [attributeKey, attributeValue] of Object.entries(nextProps)) {
    if (attributeKey.startsWith('__'))
      continue
    if (attributeKey.startsWith('on')) {
      dom.addEventListener(
        attributeKey.slice(2).toLowerCase(),
        attributeValue as EventListener,
      )
    }
    else if (attributeKey !== 'children') {
      // @ts-expect-error: Unreachable code error
      dom[attributeKey] = attributeValue
      if (typeof attributeValue === 'object') {
        for (const [key, value] of Object.entries(attributeValue as Object)) {
          // @ts-expect-error: Unreachable code error
          if (!dom[attributeKey])
          // @ts-expect-error: Unreachable code error
            dom[attributeKey] = {}
          // @ts-expect-error: Unreachable code error
          dom[attributeKey][key] = value
        }
      }
      else {
        // @ts-expect-error: Unreachable code error
        dom[attributeKey] = attributeValue
      }
    }
  }
}
