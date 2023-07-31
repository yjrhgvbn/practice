// TODO Optimization Type Description

export abstract class Component {
  props: Record<string, unknown>
  abstract state: unknown
  abstract setState: (value: unknown) => void
  abstract render: () => VirtualElement

  constructor(props: Record<string, unknown>) {
    this.props = props
  }

  // Identify Component.
  static REACT_COMPONENT = true
}

export interface ComponentFunction {
  new (props: Record<string, unknown>): Component
  (props: Record<string, unknown>): VirtualElement | string
}
export type VirtualElementType = ComponentFunction | string | number

export interface VirtualElementProps {
  children?: VirtualElement[]
  [propName: string]: unknown
}
export interface VirtualElement {
  type: VirtualElementType
  props: VirtualElementProps
}

export type FiberNodeDOM = Element | Text | null | undefined
export interface FiberNode<S = any> extends VirtualElement {
  alternate: FiberNode<S> | null
  dom?: FiberNodeDOM
  // react 使用二进制标记，这里简单使用字符串
  flag?: string
  child?: FiberNode
  return?: FiberNode
  sibling?: FiberNode
  hooks?: {
    state: S
    queue: S[]
  }[]
}
