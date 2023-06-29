import type { HTMLAttributes, ReactHTML, ClassAttributes } from "react";

export function createElement(type: any, props: any, ...children: any[]): Vnode {
  // if (typeof type === "function") return type;
  return new Vnode(type, props, children);
}

export class Vnode {
  type: any;
  props: any;
  children: any[];

  constructor(
    type: keyof ReactHTML,
    props: (ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement>) | null,
    children: (Vnode | (() => Vnode))[]
  ) {
    this.type = type;
    this.props = props || null;
    this.children = children;
  }
}

export class Component {
  state: any[] = [];
  render: (() => Vnode) | null = null;
  vNode: Vnode | null = null;
  parent: Component | null = null;
  children: Component[] = [];
  dom: Node | null = null;
}

export default {
  createElement,
};
