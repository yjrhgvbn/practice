// 渲染dom
export function renderDom(element: any) {
  let dom: DocumentFragment | Text | HTMLElement | null = null;

  if (typeof element === "string") {
    dom = document.createTextNode(element);
    return dom;
  }

  if (typeof element === "number") {
    dom = document.createTextNode(element.toString());
    return dom;
  }

  if (Array.isArray(element)) {
    dom = document.createDocumentFragment();
    for (let item of element) {
      const child = renderDom(item);
      if (child) {
        dom.appendChild(child);
      }
    }
    return dom;
  }
  if (element?.type) {
    dom = document.createElement(element?.type);
    updateProps(dom, element?.props);
    return dom;
  }

  return document.createElement("div");
}

function updateProps(element: Node | null, props: any) {
  if (!element) return;
  for (let key in props) {
    if (key === "children") continue;
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, props[key]);
    } else if (key === "className") {
      const classes = props[key].split(" ");
      classes.forEach((classKey: string) => {
        (element as HTMLElement).classList.add(classKey);
      });
    } else if (key === "style") {
      const style = props[key] as string[];
      for (let attr in style) {
        (element as HTMLElement).style[attr] = style[attr];
      }
    }
  }
}
