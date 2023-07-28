import type { VirtualElement, VirtualElementType } from './type'

export function createElement(type: VirtualElementType,
  props: Record<string, unknown> = {},
  ...children: VirtualElement[]): VirtualElement {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}
