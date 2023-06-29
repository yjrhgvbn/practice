import { Vnode, Component } from "./react";
import { renderDom } from "./render";
let rootDom: HTMLElement | null = null;
// 当前组件，用于useState时绑定组件
let curComponent: Component | null = null;
// 当前hook索引
let curHookIndex = -1;

export function getHookIndex() {
  curHookIndex++;
  return curHookIndex;
}

export function render(vNode: Vnode | (() => Vnode), element: HTMLElement, parent: Component | null = null) {
  if (!rootDom) rootDom = element;
  const newComponent = new Component();
  if (parent) {
    parent.children.push(newComponent);
    newComponent.parent = parent;
  }
  curComponent = newComponent;
  curHookIndex = 0;
  if (typeof vNode === "function") {
    newComponent.render = vNode;
  } else {
    if (typeof vNode.type === "function") {
      newComponent.render = () => vNode.type(vNode.props);
    } else {
      newComponent.render = () => vNode;
    }
  }
  let node = newComponent.render();
  const newDom = renderDom(node);
  if (!newDom) throw new Error("error dom");
  newComponent.vNode = node;
  newComponent.dom = newDom;
  element.appendChild(newDom);
  node?.children?.forEach((child) => {
    if (child === null || child === undefined) return;
    if (Array.isArray(child)) {
      child.forEach((item) => {
        render(item, newDom as HTMLElement, newComponent);
      });
    } else {
      render(child, newDom as HTMLElement, newComponent);
    }
  });
}

export function updateComponent(com: Component) {
  curComponent = com;
  const node = com!.render!();
  const parentDom = com.parent?.dom || rootDom!;
  parentDom.removeChild(com.dom!);
  const newDom = renderDom(node);
  if (!newDom) throw new Error("error dom");
  com.dom = newDom;
  parentDom.appendChild(newDom);
  com.vNode = node;
  // 全部重新渲染，不考虑复用了
  node.children?.forEach((child) => {
    render(child, newDom as HTMLElement, com);
  });
}

export default {
  render,
};
export { curComponent, curHookIndex };
