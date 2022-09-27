import { identityComponent, isPlainObject, omit, isFunction, isPromise, isArray, svgTags, resolveObservableState, resolveEventName, isBoolean, isString, isSomeVNode, isUndefined, normalizeElementProps, noop, resolveNextNodes, def } from '@setsuna/share';
import { Observable, isObservable, RETURN } from '@setsuna/observable';

const Fragment = identityComponent("Fragment 为内部组件，禁止直接使用");

const _node_flag = Symbol("VNode");
const isVNode = value => isPlainObject(value) && value[_node_flag];

const _jsx = (type, props, ...children) => {
  const _props = props ?? {};
  const VNode = {
    type,
    key: _props.key,
    props: omit(_props, ["key"]),
    children:
      type === "text" ? children : normalizeChildren(children)._children,
    _c: null,
    _e: null,
    [_node_flag]: true
  };
  if (isFunction(type)) {
    VNode._hmrId = type.hmrId;
    VNode._file = type.file;
  }
  return VNode
};

function normalizeChildren(
  children,
  options = { _children: [], textNode: "", top: true }
) {
  const size = children.length;
  for (let index = 0; index < size; index++) {
    const item = children[index];

    if (item === null || item === undefined) {
      continue
    } else if (isVNode(item) || isPromise(item) || isFunction(item)) {
      if (options.textNode.length > 0) {
        options._children.push(_jsx("text", {}, options.textNode));
        options.textNode = "";
      }
      options._children.push(item);
    } else if (isArray(item)) {
      normalizeChildren(item, { ...options, top: false });
    } else {
      options.textNode += String(item);
    }
  }
  if (options.top && options.textNode.length > 0) {
    options._children.push(_jsx("text", {}, options.textNode));
    options.textNode = "";
  }
  return options
}

const Await = identityComponent("Suspense 为内部组件，禁止直接使用");

const Teleport = identityComponent("Teleport 为内部组件，禁止直接使用");

function insertElement(child, parent, anchor) {
  return parent.insertBefore(child, anchor)
}

function removeElement(el) {
  return el.parentNode.removeChild(el)
}

function createTextElement(text) {
  return document.createTextNode(text)
}

function createElement(tag, attrs) {
  return svgTags[tag]
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag, attrs.is)
}

function getNextSibling(node) {  
  return node ? node.type === Fragment ? node.anchor : getElementNextSibling(node.el) : null
}

function getElementNextSibling(el) {
  return el.nextSibling
}

function setTextContent(el, text) {
  return (el.textContent = text)
}

function setAttr(el, key, value) {
  return key === "value" ? (el.value = value) : el.setAttribute(key, value)
}

function removeAttr(el, key) {
  return el.removeAttribute(key)
}

function setEvent(el, type, event, options) {
  return el.addEventListener(type, event, options)
}

function removeEvent(el, type, event, options) {
  return el.removeEventListener(type, event, options)
}

function querySelector(sel) {
  return document.querySelector(sel)
}

function unmountFragment(node) {
  node.children.forEach(unmount);
  node.el = node.anchor = null;
}

function unmountAwait(node) {
  Object.assign(node._e, {
    container: null,
    id: -99
  });
  unmountFragment(node);
}

function error$1(type, message, errorTask) {
  return errorTask ? console.error(`[setsuna \`${type}\` error]: ${message}`, ...errorTask) : console.error(type)
}

function callWithErrorHandler(VNode, fn, arg) {
  try {
    return fn(arg)
  } catch (e) {
    if (!VNode) {
      error$1(e);
    }

    let c = VNode._c;
    const errorTask = [`\n<${c.FC.name}>`];

    while (c.parentComponent) {
      c = c.parentComponent;
      errorTask.push(`\n<${c.FC.name}>`);
    }
    error$1("flushing", e instanceof Error ? `${e.name}: ${e.stack}` : e, errorTask);
  }
}

function unmountComponent(node) {
  const { update, _c: c } = node;
  const { observable, context, unmounts, subTree, parentComponent } = c;

  update.active = false;
  if (parentComponent) {
    parentComponent.deps.delete(update);
  }

  observable.forEach(input$ => {
    callWithErrorHandler(node, () => input$.complete());
  });
  Object.values(context).forEach(({ input$ }) => {
    callWithErrorHandler(node, () => input$.complete());
  });

  if (subTree) {
    unmount(subTree);
  }

  unmounts.forEach(fn => callWithErrorHandler(node, fn));
  c.container = c.VNode.el = null;
}

const ignoreElement = new WeakMap();

const patchedValue = Symbol("patchedValue");
function patchProps(el, newProps, oldProps) {
  oldProps = { ...oldProps };
  newProps = { ...newProps };
  if (oldProps === newProps) {
    return
  }

  for (const key in newProps) {
    let nValue = newProps[key];
    let oValue = oldProps[key];

    if (Object.is(oValue, nValue)) {
      if (resolveObservableState(nValue) !== undefined) {
        nValue = nValue();
      }
      if (resolveObservableState(oValue) !== undefined) {
        oValue = oValue.state;
      }
      if (Object.is(oValue, nValue)) {
        oldProps[key] = patchedValue;
        continue
      }
    }

    if (resolveObservableState(nValue)) {
      nValue = nValue();
    }

    if (isFunction(oValue)) {
      removeEvent(el, resolveEventName(key), oValue);
      oldProps[key] = patchedValue;
    }

    if (isFunction(nValue)) {
      setEvent(el, resolveEventName(key), nValue);
    } else if (isBoolean(nValue)) {
      setAttr(el, key, nValue ? "" : nValue);
    } else {
      setAttr(el, key, nValue);
    }
    oldProps[key] = patchedValue;
  }

  for (const key in oldProps) {
    const value = oldProps[key];
    if (value === patchedValue) {
      continue
    }

    isFunction(value)
      ? removeEvent(el, resolveEventName(key), value)
      : removeAttr(el, key);
  }
}

function hydrateProps(el, attrs) {
  el.getAttributeNames().forEach(key => {
    const attr = attrs[key];
    if (!attr) {
      error$1("hydrating attrs", "缺少属性", [key]);
      attrs[key] = patchedValue;
      removeAttr(el, key);
      return
    }

    let _attr = el.getAttribute(key);
    const reactive = _attr ? _attr.match("Observable<(.*?)>") : null;
    if (reactive !== null) {
      _attr = reactive[0];
    }
    if (!isBoolean(attr) && attr != _attr) {
      error$1("hydrating attrs", "属性值对不上", _attr);
      setAttr(el, key, attr);
    }
    attrs[key] = patchedValue;
  });

  Object.keys(attrs).forEach(key => {
    const attr = attrs[key];
    if (attr === patchedValue) {
      return
    }

    if (isFunction(attr)) {
      setEvent(el, resolveEventName(key), attr);
    } else {
      error$1("hydrating attrs", "属性值对不上", attr);
      setAttr(el, key, attr);
    }
  });
}

function unmountELement(node) {
  const { _e: e } = node;
  const { el, attrs, ref } = e;

  e.children.forEach(unmount);

  if (!el) {
    // hmr. el is null/undefined
    return
  }

  if (ref) {
    ref.complete();
  }

  patchProps(el, {}, attrs);
  removeElement(el);
  node.el = e.el = null;
}

function unmountTeleport(VNode) {
  unmount(VNode._e.Body);
  VNode._e = null;
}

function unmountTextElement(node) {
  const { el } = node;
  if (!el) {
    // hmr. el is null/undefined
    return
  }
  
  removeElement(el);
  node.el = node._e.el = null;
}

function unmount(node) {
  const { type } = node;
  switch (type) {
    case Fragment:
      unmountFragment(node);
      break
    case "text":
      unmountTextElement(node);
      break
    case Teleport:
      unmountTeleport(node);
      break
    case Await:
      unmountAwait(node);
      break
    case "children":
      unmountFragment(node);
      break
    default: {
      if (isString(type) || ignoreElement.has(type)) {
        unmountELement(node);
      } else if (isFunction(type)) {
        unmountComponent(node);
      } else {
        throw `unmount error: 未知的卸载节点类型(${String(type)})`
      }
    }
  }
}

function mountChildren(children, options) {
  const size = children.length;
  if (size === 0) {
    return
  }

  for (let i = 0; i < size; i++) {
    patch$1({ ...options, newVNode: children[i] });
  }
}

function hydrateChildren(children, options) {
  const size = children.length;
  if (size === 0) {
    return null
  }

  let hydrateNode = options.hydrateNode ?? options.container.firstChild;
  for (let i = 0; i < children.length; i++) {
    hydrateNode = patch$1({ ...options, hydrateNode, newVNode: children[i] });
  }

  return hydrateNode
}

function patchChildren(
  oldChildren,
  newChildren,
  { container, anchor, ...rest }
) {
  let s1 = 0;
  let e1 = oldChildren.length - 1;

  let s2 = 0;
  let e2 = newChildren.length - 1;

  let oldKeyMap = null;

  while (s1 <= e1 && s2 <= e2) {
    const sNode1 = oldChildren[s1];
    const eNode1 = oldChildren[e1];

    const sNode2 = newChildren[s2];
    const eNode2 = newChildren[e2];

    if (sNode1 === null) {
      s1++;
    } else if (eNode1 === null) {
      e1--;
    } else if (isSomeVNode(sNode1, sNode2)) {
      patch$1({
        ...rest,
        oldVNode: sNode1,
        newVNode: sNode2,
        container,
        anchor
      });
      s1++;
      s2++;
    } else if (isSomeVNode(eNode1, eNode2)) {
      patch$1({
        ...rest,
        oldVNode: eNode1,
        newVNode: eNode2,
        container,
        anchor
      });
      e1--;
      e2--;
    } else if (isSomeVNode(sNode1, eNode2)) {
      patch$1({
        ...rest,
        oldVNode: sNode1,
        newVNode: eNode2,
        container,
        anchor
      });
      insertElement(eNode2.el, container, getNextSibling(eNode1));
      s1++;
      e2--;
    } else if (isSomeVNode(eNode1, sNode2)) {
      patch$1({
        ...rest,
        oldVNode: eNode1,
        newVNode: sNode2,
        container,
        anchor
      });
      insertElement(sNode2.el, container, sNode1.el);
      s2++;
      e1--;
    } else {
      if (!oldKeyMap) {
        oldKeyMap = new Map();
        oldChildren.forEach((item, index) => {
          if (
            item.key !== undefined &&
            item.key !== null &&
            !Number.isNaN(item.key)
          ) {
            oldKeyMap.set(item.key, index);
          }
        });
      }

      const index = isUndefined(sNode2.key)
        ? findOldIndex(sNode2, oldChildren, s1, e1)
        : oldKeyMap.get(sNode2.key);

      if (isUndefined(index)) {
        patch$1({
          ...rest,
          oldVNode: null,
          newVNode: sNode2,
          container,
          anchor: sNode1.el
        });
      } else {
        const oNode = oldChildren[index];
        if (isSomeVNode(oNode, sNode2)) {
          patch$1({
            ...rest,
            oldVNode: oNode,
            newVNode: sNode2,
            container,
            anchor: sNode1.el
          });
          insertElement(sNode2.el, container, sNode1.el);
          oldChildren[index] = null;
        } else {
          patch$1({
            ...rest,
            oldVNode: null,
            newVNode: sNode2,
            container,
            anchor: getNextSibling(oNode)
          });
          unmount(oNode);
        }
      }
      s2++;
    }
  }

  // 旧的更新完 && 新的尚未更新完
  if (s1 > e1 && s2 <= e2) {
    for (let i = s2; i <= e2; i++) {
      const node = newChildren[i];
      patch$1({
        ...rest,
        oldVNode: null,
        newVNode: node,
        container,
        anchor: isUndefined(newChildren[e2 + 1]) ? null : newChildren[e2 + 1].el
      });
    }
  }
  // 新的更新完 && 旧的尚未更新完
  else if (s2 > e2 && s1 <= e1) {
    for (let i = s1; i <= e1; i++) {
      const node = oldChildren[i];
      node && unmount(node);
    }
  }
}

function findOldIndex(n, children, start, end) {
  for (let index = start; index <= end; index++) {
    const _n = children[index];
    if (_n !== null && n.type === _n.type) {
      return index
    }
  }
}

function renderAwaitToString({ VNode: { children }, parentComponent }) {
  const childrenElement = ["<!-- Await -->", "<!-- Fragment -->"];
  const size = children.length;
  for (let index = 0; index < size; index++) {
    const node = children[index];
    if (!isFunction(node)) {
      childrenElement.push(nodeToString({ VNode: node, parentComponent }));
      continue
    }

    childrenElement.push(
      new Promise(async resolve => {
        const _node = await Promise.resolve(node());
        const VNode = normalizeChildren([_node])._children[0];
        const buff = nodeToString({ VNode, parentComponent });
        resolve(buff);
      })
    );
    childrenElement.push("<!-- /Await -->");
  }
  return childrenElement
}

function renderFragmentToString({
  VNode: { children },
  parentComponent
}) {
  return [
    "<!-- Fragment -->",
    children.map(VNode => nodeToString({ VNode, parentComponent })),
    // "<!-- /Fragment -->"
  ]
}

function renderChildrenToString({ VNode, parentComponent }) {
  VNode.children = parentComponent.slot;
  return renderFragmentToString({ VNode, parentComponent })
}

let activeComponentContext = [];
const getCurrentInstance = () => activeComponentContext.at(-1);
const setCurrentInstance = ins => {
  return ins ? activeComponentContext.push(ins) : activeComponentContext.pop()
};

function renderComponentToString({ VNode, parentComponent }) {
  const { type, props, children } = VNode;
  const _c = (VNode._c = {
    cid: null,
    FC: type,
    props,
    container: null,
    parentComponent: null,
    slot: children,
    subTree: null,
    render: null,
    observable: [],
    deps: new Set(),
    mounts: [],
    unmounts: [],
    updates: [],
    context: parentComponent
      ? Object.create(parentComponent.context)
      : Object.create(null),
    mounted: false,
    VNode
  });

  setCurrentInstance(_c);
  const render = (_c.render = callWithErrorHandler(VNode, type, props));
  setCurrentInstance(null);

  if (!isFunction(render)) {
    error$1("component mount", `render 应为是一个函数`, [render]);
    return ""
  }

  const subTree = (_c.subTree = callWithErrorHandler(VNode, render));
  if (subTree === null) {
    return ""
  }

  return nodeToString({ VNode: subTree, parentComponent: _c })
}

function renderElementToString({ VNode, parentComponent }) {
  const { type, props, children } = VNode;
  return [
    `<${type}`,
    renderElementAttrsToString(normalizeElementProps(omit(props, "ref"))),
    ">",
    children.map(VNode => nodeToString({ VNode, parentComponent })),
    `</${type}>`
  ]
}

function renderElementAttrsToString(attrs) {
  let attrStr = "";
  for (const [key, value] of Object.entries(attrs)) {
    const input$ = resolveObservableState(value);

    if (input$) {
      attrStr += ` ${key}="Observable<${value()}>"`;
    } else if (value === true) {
      attrStr += ` ${key}`;
    } else if (key.startsWith("on") && isFunction(value)) ; else {
      attrStr += ` ${key}="${value}"`;
    }
  }
  attrStr = attrStr.trim();
  return attrStr.length > 0 ? ` ${attrStr}` : ""
}

function renderTextElementToString({ VNode: { children } }) {
  return children[0]
}

function nodeToString(renderContext) {
  const type = renderContext.VNode.type;

  if (type === Fragment) {
    return renderFragmentToString(renderContext)
  } else if (type === "children") {
    return renderChildrenToString(renderContext)
  } else if (type === Teleport) {
    throw Error(
      "[renderTeleportToString error]: 服务端不支持teleport的服务端渲染"
    )
  } else if (type === Await) {
    return renderAwaitToString(renderContext)
  } else if (type === "text") {
    return renderTextElementToString(renderContext)
  } else if (isString(type)) {
    return renderElementToString(renderContext)
  } else if (ignoreElement.has(type)) {
    return type.ssrRender(renderContext)
  }
  if (isFunction(type)) {
    return renderComponentToString(renderContext)
  } else {
    throw `patch error: 未识别的类型(${String(type)})`
  }
}

const records$1 = window.__SETSUNA_CUSTOM_ELEMENT ?? new Map();

let sid = 0;
let rid = 0;
function defineElement(name, fc) {
  let record = records$1.get(name);
  if (record) {
    record.instance.reload(fc);
    return { wrapper: noop }
  }

  class TElement extends HTMLElement {
    static displayName = name
    static ssrRender({ VNode: { props, children }, parentComponent }) {
      const tempBuf = nodeToString({
        VNode: _jsx(fc, props),
        parentComponent: null
      });
      const tagBuf = nodeToString({
        VNode: _jsx(name, Object.assign(props, { hydrate: true }), ...children),
        parentComponent
      });
      return [
        `<template component-name="${name}-${sid++}">`,
        tempBuf,
        "</template>",
        tagBuf
      ]
    }

    constructor() {
      super();
      this.connected = false;
      this.fc = fc;
      this.props = {};
      this.shadow = this.attachShadow({ mode: "open" });
      this.initAttribute();
      this.initProxyMethod();

      initTemplateMap();
      record.instance = this;
    }

    connectedCallback() {
      if (this.props.hydrate === "") {
        return
      }

      render((this._VNode = this._createVNode()), this.shadow);
      this.connected = true;
    }

    hydrate() {
      this.shadow.innerHTML = templateMap.get(`${name}-${rid++}`);
      hydrate((this._VNode = this._createVNode()), this.shadow);
      return this.nextSibling
    }

    reload(fc) {
      unmount(this._VNode);
      this.shadow.innerHTML = "";
      this.fc = fc;
      render((this._VNode = this._createVNode()), this.shadow);
    }

    disconnectedCallback() {
      unmount(this._VNode);
      this.shadow.innerHTML = "";
      this.connected = false;
      this.props = {};
      this.fc = null;
      this.root = null;
      this.getAttribute = this.originGetAttribute;
      this.setAttribute = this.originSetAttribute;
      this.addEventListener = this.originAddEventListener;
      this.removeEventListener = this.originRemoveAttribute;
    }

    initProxyMethod() {
      this.originGetAttribute = this.getAttribute;
      this.getAttribute = this._getAttribute;

      this.originSetAttribute = this.setAttribute;
      this.setAttribute = this._setAttribute;

      this.originRemoveAttribute = this.removeAttribute;
      this.removeAttribute = this._removeAttribute;

      this.originAddEventListener = this.addEventListener;
      this.addEventListener = this._setAttribute;

      this.originRemoveEventListener = this.removeEventListener;
      this.removeEventListener = this._removeAttribute;
    }

    initAttribute() {
      this.getAttributeNames().forEach(key => {
        const value = this.getAttribute(key);
        if (value === "" || value === "true") {
          this.props[key] = "";
          this.setAttribute(key, "");
          return
        }

        const _value = Number(value);
        this.props[key] = Number.isNaN(_value) ? value : _value;
      });
    }

    _setAttribute(key, value) {
      if (value === this.props[key]) {
        return
      }

      if (typeof value === "number" || typeof value === "string") {
        this.originSetAttribute(key, value);
      } else if (typeof value === "boolean") {
        value
          ? this.originSetAttribute(key, "")
          : this.originRemoveAttribute(key);
      } else {
        this.originRemoveAttribute(key);
      }

      this.props[key] = value;
      this._update();
    }

    _getAttribute(key) {
      return this.props[key]
    }

    _removeAttribute(key) {
      this.originRemoveAttribute(key);
      this.props[key] = void 0;
      this._update();
    }

    _update() {
      if (!this.connected) {
        return
      }

      const newVNode = this._createVNode();
      const oldVNode = this._VNode;
      patch({
        oldVNode,
        newVNode,
        container: this.shadow,
        anchor: null,
        parentComponent: null,
        shallow: false
      });
      this._VNode = newVNode;
    }

    _createVNode() {
      return _jsx(
        this.fc,
        new Proxy(this.props, {
          set(target, key, value, receiver) {
            if (!(key in target)) {
              return false
            }

            return Reflect.set(target, key, value, receiver)
          }
        })
      )
    }
  }

  ignoreElement.set(TElement, true);
  records$1.set(name, (record = { element: TElement }));
  customElements.define(name, TElement);

  return {
    wrapper: () => record.element
  }
}

let templateMap = new Map();
function initTemplateMap() {
  document.querySelectorAll("[component-name]").forEach(node => {
    if (node.nodeName === "TEMPLATE") {
      templateMap.set(node.getAttribute("component-name"), node.innerHTML);
      removeElement(node);
    }
  });
}

function mountFragment(context) {
  const { newVNode: node } = context;
  mountChildren(node.children, context);
  node.el = node.children[0]?.el;
  node.anchor = getNextSibling(node.children.at(-1));
}

function hydrateFragment(context) {
  const { newVNode: node, container } = context;
  node._e ?? (node._e = { container });

  let { hydrateNode } = context;
  hydrateNode = hydrateNode ?? container.firstChild;
  if (!hydrateNode || hydrateNode.textContent.trim() !== "Fragment") {
    error$1(
      "hydrate fragment",
      `节点对不上，期望得到(<Fragment/>)，却匹配到(${
        hydrateNode ? hydrateNode.tagName.toLowerCase() : "null"
      }) fragment 节点对不上`,
      []
    );

    mountFragment({ ...context, hydrate: false, anchor: hydrateNode });
    return hydrateNode
  }

  const removeNode = hydrateNode;
  hydrateNode = getElementNextSibling(hydrateNode);
  removeElement(removeNode);

  const nextHydrateNode = hydrateChildren(node.children, {
    ...context,
    hydrateNode
  });
  node.el = node.children[0]?.el;
  node.anchor = getNextSibling(node.children.at(-1));
  return nextHydrateNode
}

function updateFragment(context) {
  const { oldVNode, newVNode, container, ...rest } = context;
  patchChildren(oldVNode.children, newVNode.children, {
    ...rest,
    container: container ?? oldVNode.el
  });
  newVNode.el = newVNode.children[0].el;
  newVNode.anchor = getElementNextSibling(newVNode.children.at(-1));
}

function patchFragment(context) {
  const { oldVNode, hydrate } = context;
  return oldVNode
    ? updateFragment(context)
    : !hydrate
    ? mountFragment(context)
    : hydrateFragment(context)
}

function mountAwait(context) {
  const { newVNode: node, container } = context;
  const { props, children } = node;
  const hasAsync = children.some(
    content => isFunction(content) || isPromise(content)
  );
  const e = node._e ?? (node._e = { id: 0, container, VNode: node });
  const id = e.id;

  if (hasAsync) {
    node.children = props.fallback
      ? normalizeChildren([props.fallback])._children
      : [];

    Promise.all(
      children.map(content =>
        Promise.resolve(isFunction(content) ? content() : content)
      )
    ).then(_children => {
      if (e.id !== id) {
        return
      }

      const newVNode = {
        ...node,
        children: normalizeChildren(_children)._children
      };
      patchFragment({ ...context, oldVNode: node, newVNode });
      Object.assign(node, newVNode);
    });
  } else {
    node.children = normalizeChildren(children)._children;
  }

  patchFragment(context);
}

function hydrateAwait(context) {
  const { newVNode: node, container } = context;
  const { children } = node;

  let { hydrateNode } = context;
  hydrateNode = hydrateNode ?? container.firstChild;
  if (!hydrateNode || hydrateNode.textContent.trim() !== "Await") {
      error(
      "hydrate Await",
      `节点不匹配，期望得到(<Await />)，却匹配到(${
        hydrateNode ? hydrateNode.tagName.toLowerCase() : "null"
      })`,
      []
    );

    mountAwait({ ...context, hydrate: false, anchor: hydrateNode });
    return hydrateNode
  }

  const hasAsync = children.some(
    content => isFunction(content) || isPromise(content)
  );
  const e = node._e ?? (node._e = { id: 0, container, VNode: node });
  const id = e.id;
  const endHydrateNode = resolveNextNodes(hydrateNode, "Await").at(-1);

  if (!hasAsync) {
    context.hydrateNode = getElementNextSibling(hydrateNode);
    node.children = normalizeChildren(children)._children;

    removeElement(hydrateNode);
    removeElement(endHydrateNode);

    return hydrateFragment(context)
  }

  Object.assign(e, { hydrating: true, hydrateNode, endHydrateNode });

  Promise.all(
    children.map(content =>
      Promise.resolve(isFunction(content) ? content() : content)
    )
  ).then(_children => {
    if (e.id !== id) {
      return
    }

    context.hydrateNode = getElementNextSibling(e.hydrateNode);
    node.children = normalizeChildren(_children)._children;

    removeElement(e.hydrateNode);
    removeElement(e.endHydrateNode);
    e.hydrating = false;
    e.hydrateNode = e.endHydrateNode = null;

    hydrateFragment(context);
  });

  return getElementNextSibling(e.endHydrateNode)
}

function updateAwait(context) {
  const { newVNode, oldVNode } = context;
  const { props, children } = newVNode;
  const e = (newVNode._e = oldVNode._e);
  const id = e.id;

  // 防止因为 active 阻碍更新后，后边的 children diff 对不上
  newVNode.children = oldVNode.children;
  newVNode.el = oldVNode.el;
  e.VNode = newVNode;

  if (e.hydrating) {
    const _nodes = resolveNextNodes(e.hydrateNode, "Await");
    context.anchor = getElementNextSibling(_nodes.at(-1));
    _nodes.forEach(removeElement);
    Object.assign(e, {
      id: id + 1,
      hydrating: false,
      hydrateNode: null,
      endHydrateNode: null
    });
    context.oldVNode = null;
    mountAwait(context);
    return
  }

  const _active = newVNode.props.active;
  const active = isFunction(_active)
    ? !!callWithErrorHandler(newVNode, _active)
    : false;

  if (!active) {
    return
  }

  e.id = id + 1;

  if (children.some(content => isFunction(content) || isPromise(content))) {
    newVNode.children = normalizeChildren([props.fallback])._children;

    Promise.all(
      children.map(content =>
        Promise.resolve(isFunction(content) ? content() : content)
      )
    ).then(_children => {
      if (e.id - 1 !== id) {
        return
      }

      const newVNode = {
        ...e.VNode,
        children: normalizeChildren(_children)._children
      };
      patchFragment({ ...context, oldVNode: e.VNode, newVNode: newVNode });
      Object.assign(e.VNode, newVNode);
    });
  } else {
    newVNode.children = normalizeChildren(children)._children;
  }

  patchFragment(context);
}

function patchAwait(context) {
  const { oldVNode, hydrate } = context;
  return oldVNode
    ? updateAwait(context)
    : !hydrate
    ? mountAwait(context)
    : hydrateAwait(context)
}

function patchSlot(context) {
  const { parentComponent, VNode, slot } = context.parentComponent;
  parentComponent.deps.add(VNode.update);
  context.newVNode.children = slot;
  return patchFragment(context)
}

if (!globalThis?.window?.__SETSUNA_HMR_MAP__) {
  globalThis.window.__SETSUNA_HMR_MAP__ = {
    invokeReload
  };
}

const records = new Map();

function registryRecord(id, renderEffect) {
  let record = records.get(id);
  if (!record) {
    records.set(id, (record = { deps: new Set() }));
  }

  record.deps.add(renderEffect);
}

function invokeReload(id, App) {
  const appRecord = records.get(id);
  const deps = [...appRecord.deps];
  appRecord.deps.clear();
  deps.forEach(renderEffect => {
    const { c, active } = renderEffect;
    if (!active) return

    const { VNode, parentComponent, container } = c;
    const newVNode = _jsx(App, VNode.props, ...VNode.children);
    patch$1({
      oldVNode: VNode,
      newVNode,
      container,
      anchor: VNode.anchor,
      parentComponent,
      deep: false,
      hydrate: false
    });

    Object.assign(VNode, newVNode);
    c.VNode = VNode;
  });
}

let pending = true;
let pendingQueue = [];
let flushingQueue = [];
let workingJob = null;
const postQueue = [];

function flushJobs() {
  flushingQueue = pendingQueue;
  pendingQueue = [];

  if (flushingQueue.length > 1) {
    flushingQueue.sort((a, b) => a.c.cid - b.c.cid);
  }

  while ((workingJob = flushingQueue.shift())) {
    callWithErrorHandler(workingJob.c.VNode, workingJob);
  }

  if (pendingQueue.length > 0) {
    flushJobs();
  }
}

const schedulerJobs = (() => {
  if ("MessageChannel" in globalThis) {
    const { port1, port2 } = new globalThis.MessageChannel();
    port1.onmessage = _schedulerJobs;
    return () => port2.postMessage(null)
  } else {
    return () => setTimeout(_schedulerJobs)
  }

  function _schedulerJobs() {
    pending = false;
    flushJobs();
    pending = true;
    flushPostQueue();
  }
})();

function appendJob(job, deep = false) {
  if (flushingQueue.includes(job) || pendingQueue.includes(job)) {
    if (deep) job.deep = true;
    return
  }

  job.deep = deep;
  pendingQueue.push(job);

  if (pending) {
    schedulerJobs();
  }
}

function flushPostQueue() {
  postQueue.forEach(({ VNode, fns }) => {
    fns.forEach(fn => {
      callWithErrorHandler(VNode, fn);
    });
  });
  postQueue.length = 0;
}

function createRenderComponentEffect(options) {
  function renderComponentEffect() {
    const { c, anchor, deep } = renderComponentEffect;
    let { hydrateNode, hydrate } = renderComponentEffect;
    const {
      render,
      mounted,
      updates,
      subTree: preSubTree,
      container,
      deps,
      mounts,
      VNode
    } = c;

    setCurrentInstance(c);
    const nextSubTree = callWithErrorHandler(VNode, render);
    setCurrentInstance(null);

    if (mounted) {
      const updated = { VNode, fns: [] };
      updates.forEach(updateFn => {
        const fn = callWithErrorHandler(VNode, updateFn);
        if (isFunction(fn)) {
          updated.fns.push(fn);
        }
      });
      updated.fns.length > 0 && postQueue.push(updated);

      patch$1({
        oldVNode: preSubTree,
        newVNode: (c.subTree = nextSubTree),
        container: container,
        anchor,
        parentComponent: c,
        deep
      });

      const invalid = [];
      deps.forEach(u => (u.active ? appendJob(u) : invalid.push(u)));
      invalid.forEach(u => deps.delete(u));

      VNode.el = nextSubTree?.el;
    } else {
      let nextNode = hydrateNode;
      Object.assign(c, {
        mounted: true,
        unmounts: mounts.map(fn => callWithErrorHandler(VNode, fn))
      });

      if (nextSubTree !== null) {
        nextNode = patch$1({
          oldVNode: null,
          newVNode: (c.subTree = nextSubTree),
          container,
          anchor,
          parentComponent: c,
          deep,
          hydrate,
          hydrateNode
        });
      }

      VNode.el = nextSubTree?.el;
      VNode.anchor = nextSubTree
        ? getNextSibling(nextSubTree)
        : null;
      Object.assign(renderComponentEffect, {
        hydrate: false,
        hydrateNode: null
      });

      return nextNode
    }
  }

  Object.assign(renderComponentEffect, options);
  options = null;
  return renderComponentEffect
}

let cid = 0;
function mountComponent(context) {
  const {
    newVNode: node,
    container,
    anchor,
    parentComponent,
    deep,
    hydrate,
    hydrateNode
  } = context;
  const { type, props, children } = node;
  const c = (node._c = {
    cid: cid++,
    FC: type,
    props,
    container,
    parentComponent,
    slot: children,
    subTree: null,
    render: null,
    observable: [],
    deps: new Set(),
    mounts: [],
    unmounts: [],
    updates: [],
    context: parentComponent
      ? Object.create(parentComponent.context)
      : Object.create(null),
    mounted: false,
    VNode: node
  });
  const { props: _props, observable, context: componentContext } = c;
  const update = (node.update = createRenderComponentEffect({
    c,
    anchor,
    deep,
    active: true,
    hydrate,
    hydrateNode
  }));

  {
    registryRecord(node._hmrId, update);
  }

  setCurrentInstance(c);
  let render = callWithErrorHandler(node, type, _props);
  setCurrentInstance(null);

  if (!isFunction(render)) {
    error$1("component", `render 应为是一个函数`, [render]);
    render = () => null;
  }

  c.render = render;

  observable.forEach(observable => bindReactiveUpdate(observable, node));
  Object.values(componentContext).forEach(ctxValue =>
    bindContextUpdate(ctxValue, node)
  );

  return update()
}

function bindReactiveUpdate(input$, { update }) {
  input$.subscribe(() => appendJob(update));
}

function bindContextUpdate({ input$ }, { update }) {
  input$.subscribe(() => appendJob(update, true));
}

function updateComponent(context) {
  const { oldVNode, newVNode, deep } = context;
  const { _c: c, update } = oldVNode;
  newVNode._c = c;
  newVNode.update = update;
  c.slot = newVNode.children;
  c.VNode = newVNode;

  if (deep) {
    appendJob(update, (update.deep = true));
  } else {
    appendJob(update);
  }
}

function patchComponent(context) {
  return context.oldVNode ? updateComponent(context) : mountComponent(context)
}

function normalizeElementNode(node, create) {
  const { type, props, children } = node;
  const tag = isFunction(type) ? type.displayName : type;
  return (node._e = {
    el: create ? createElement(tag, props) : null,
    tag,
    ref: props.ref,
    attrs: normalizeElementProps(omit(props, "ref")),
    children,
    VNode: node
  })
}

function setElementRef(e) {
  if (!e.ref) {
    return
  }

  const input$ = (e.ref = resolveObservableState(e.ref));
  input$ ? input$.next(e.el) : error("Element", `不是合法 ref`, [ref]);
}

function mountElement(context) {
  const { newVNode: node, anchor, container } = context;
  const e = normalizeElementNode(node, true);

  patchProps(e.el, e.attrs, {});
  insertElement(e.el, container, anchor);
  mountChildren(e.children, { ...context, anchor: null, container: e.el });
  setElementRef(e);
  node.el = e.el;
}

function hydrateElement(context) {
  const { newVNode: node, container, hydrateNode } = context;
  const { type, children } = node;
  const e = normalizeElementNode(node, false);
  const isCustomWrapper = ignoreElement.has(type);
  const isCustomElement = isCustomWrapper || type.includes("-");
  const el = (e.el = hydrateNode ?? container.firstChild);

  if (!el) {
    error$1(
      "hydrate element",
      `节点不匹配，期望得到(<${e.tag}/>)，却匹配到(${el})`,
      []
    );
    mountElement({ ...context, hydrate: false, anchor: null });
    return null
  }

  if (el.tagName.toLowerCase() !== e.tag) {
    error$1(
      "hydrate element",
      `节点对不上，期望得到(<${
        e.tag
      }/>)，却匹配到(<${el.tagName.toLowerCase()}/>)`,
      []
    );

    const anchor = getElementNextSibling(el);
    removeElement(el);
    mountElement({ ...context, hydrate: false, anchor });
    return anchor
  }

  !isCustomWrapper && !isCustomElement
    ? hydrateProps(el, e.attrs)
    : patchProps(e.el, e.attrs, {});

  hydrateChildren(children, { ...context, hydrateNode: null, container: el });

  setElementRef(e);
  node.el = el;

  return isCustomWrapper ? el.hydrate(context) : getElementNextSibling(el)
}

function updateElement(context) {
  const { oldVNode, newVNode, ...rest } = context;
  const oe = oldVNode._e;
  const e = Object.assign(normalizeElementNode(newVNode), { el: oe.el });

  patchProps(e.el, e.attrs, oe.attrs);
  patchChildren(oe.children, e.children, {
    ...rest,
    container: e.el
  });
  newVNode.el = oldVNode.el;
}

function patchElement(context) {
  const { oldVNode, hydrate } = context;
  return oldVNode
    ? updateElement(context)
    : !hydrate
    ? mountElement(context)
    : hydrateElement(context)
}

function mountTeleport(context) {
  const node = context.newVNode;
  const to = node.props.to;
  const Body = _jsx(() => () => _jsx(Fragment, {}, node.children));
  const containerSel = node.props.to;
  const container = isString(containerSel)
    ? querySelector(containerSel)
    : containerSel;
  if (!container) {
    return error$1("Teleport", "Teleport props to 不是一个有效的选择器")
  }

  render(Body, container);
  node._e = { Body, container, to, VNode: node };
  node.el = null;
}

function updateTeleport(context) {
  const { oldVNode, newVNode: node, shallow } = context;
  const e = oldVNode._e;
  const to = node.props.to;

  if (!Object.is(to, e.to)) {
    unmountTeleport(oldVNode);
    mountTeleport({ ...context, oldVNode: null });
    return
  }

  patch$1({
    oldVNode: e.Body,
    newVNode: (e.Body = _jsx(() => () => _jsx(Fragment, {}, node.children))),
    container: e.container,
    shallow
  });

  node._e = e;
  node.el = null;
}

function patchTeleport(context) {
  const { oldVNode } = context;
  return oldVNode ? updateTeleport(context) : mountTeleport(context)
}

function mountTextElement(context) {
  const { newVNode: node, container, anchor } = context;
  const content = node.children[0];
  const { el } = (node._e = {
    el: createTextElement(content),
    children: content
  });

  insertElement(el, container, anchor);
  node.el = el;
}

function hydrateTextElement(context) {
  const { newVNode: node, container } = context;
  let { hydrateNode } = context;
  hydrateNode = hydrateNode ?? container.firstChild;

  if (!hydrateNode) {
    error$1(
      "hydrate text",
      `节点对不上，期望得到(<text />)，却匹配到(\`null\`)`,
      []
    );
    mountTextElement({ ...context, anchor: null });
    return null
  }

  const _content = hydrateNode.textContent;
  const content = node.children[0];
  if (_content !== content) {
    error$1(
      "hydrate text",
      `节点对不上，期望得到(\`${content}\`)，却匹配到(\`${_content}\`)`,
      []
    );
    setTextContent(hydrateNode, content);
  }

  node._e = { el: hydrateNode, children: content };
  node.el = hydrateNode;

  return getElementNextSibling(hydrateNode)
}

function updateTextElement({ oldVNode, newVNode: node }) {
  const { children: oldContent, el } = oldVNode._e;
  const newContent = node.children[0];

  if (oldContent !== newContent) {
    setTextContent(el, newContent);
  }

  node._e = { el, children: newContent };
  node.el = oldVNode.el;
}

function patchTextElement(context) {
  const { oldVNode, hydrate } = context;
  return oldVNode
    ? updateTextElement(context)
    : !hydrate
    ? mountTextElement(context)
    : hydrateTextElement(context)
}

function patch$1(patchContext) {
  const { oldVNode, newVNode } = patchContext;

  if (Object.is(oldVNode, newVNode)) {
    return
  }

  if (oldVNode && !isSomeVNode(oldVNode, newVNode)) {
    patchContext.anchor = oldVNode.anchor;
    unmount(oldVNode);
    patchContext.oldVNode = null;
  }

  const type = newVNode.type;
  switch (type) {
    case Fragment:
      return patchFragment(patchContext)
    case "text":
      return patchTextElement(patchContext)
    case Teleport:
      return patchTeleport(patchContext)
    case Await:
      return patchAwait(patchContext)
    case "children":
      return patchSlot(patchContext)
    default: {
      if (isString(type) || ignoreElement.has(type)) {
        return patchElement(patchContext)
      } else if (isFunction(type)) {
        return patchComponent(patchContext)
      } else {
        throw `patch error: 未识别的类型(${String(type)})`
      }
    }
  }
}

function render(VNode, container) {
  patch$1({
    oldVNode: null,
    newVNode: VNode,
    container,
    anchor: null,
    parentComponent: null,
    deep: false,
    hydrate: false
  });
}

function hydrate(VNode, container) {
  patch$1({
    oldVNode: null,
    newVNode: VNode,
    container,
    anchor: null,
    parentComponent: null,
    deep: false,
    hydrate: true,
    hydrateNode: null
  });
}

function createState(value, options) {
  let oldValue = void 0;
  const { noObserver, noParam } = options ?? {};
  const input$ = new Observable(
    !noParam && isObservable(value) ? value : undefined
  );

  input$
    .pipe(newValue => (Object.is(newValue, value) ? RETURN.SKIP : newValue))
    .subscribe(v => {
      oldValue = value;
      value = v;
    });

  const originContext = getCurrentInstance();
  if (!noObserver && originContext) {
    originContext.observable.push(input$);
  }

  function state() {
    const activeRenderContext = getCurrentInstance();
    if (
      !noObserver &&
      originContext &&
      activeRenderContext &&
      activeRenderContext !== originContext
    ) {
      originContext.deps.add(activeRenderContext.VNode.update);
    }
    return value
  }
  def(state, "input$", { get: () => input$ });
  def(state, "state", { get: () => oldValue });
  return { state, input$ }
}

function useState(value, pipes) {
  if (isFunction(value)) {
    value = value();
  }

  const _input$ = resolveObservableState(value);
  const { state, input$ } = createState(_input$ ? _input$ : value);
  const setState = newState => {
    input$.next(isFunction(newState) ? newState(state()) : newState);
  };
  if (pipes) {
    if (isArray(pipes)) {
      input$.pipe(...pipes);
    } else {
      error$1("hook-useState", "不是合法的管道操作符", []);
    }
  }
  return [state, setState, input$]
}

function useProvide(key, value) {
  const activeMountContext = getCurrentInstance();
  if (!activeMountContext) {
    throw "useProvide 只能在组件内部初始化时、顶层被调用"
  }

  const { state, input$ } = createState(value, { noObserver: true });
  function setState(newState) {
    input$.next(isFunction(newState) ? newState(state()) : newState);
  }

  activeMountContext.context[key] = { state, input$ };
  return [state, setState, input$]
}

function useContext(key, value) {
  const activeMountContext = getCurrentInstance();
  if (!activeMountContext) {
    throw "useContext 只能在组件内部初始化时、顶层被调用"
  }

  const ctxValue = activeMountContext.context[key];
  return () => (ctxValue ? ctxValue.state() : value)
}

let id = 0;
function createContext(key) {
  const ctxKey = `$$context(${key ?? id++})`;
  return [useProvide.bind(null, ctxKey), useContext.bind(null, ctxKey)]
}

function useUpdate(fn) {
  const activeMountContext = getCurrentInstance();
  return activeMountContext
    ? activeMountContext.updates.push(fn)
    : error$1("hook-useUpdate", "useUpdate 只能在组件挂载期间才可以调用", [])
}

function useMount(fn) {
  const activeMountContext = getCurrentInstance();
  return activeMountContext
    ? activeMountContext.mounts.push(fn)
    : error$1("hook-useMount", "useMount 只能在组件挂载期间才可以调用", [])
}

function useChildren() {
  const activeContext = getCurrentInstance();
  return activeContext
    ? [...activeContext.slot]
    : error$1("hook-useChildren", "useChildren 只能在组件挂载期间才可以调用", [])
}

function useEffect(subObs, subscribe) {
  if (!isArray(subObs)) {
    return error$1(
      "观察者目标必须是一个 Array<Observable> | Array<State> 类型的数组"
    )
  }
  subObs.forEach(value => {
    const ob = resolveObservableState(value);
    ob
      ? ob.subscribe(subscribe)
      : error$1("订阅目标不是一个合法的 Observable state");
  });
}

function useComputed(subObs, options) {
  let getter, setter;
  if (isPlainObject(options)) {
    getter = options.get ?? noop;
    setter = options.set ?? noop;
  } else {
    getter = options ?? noop;
  }

  const { state, input$ } = createState(getter(), { noParam: true });
  const setState = newState => {
    if (!setter) {
      return error$1("hook-useComputed", "setter 修改器未定义，禁止修改")
    }
    isFunction(newState) ? setter(newState(state())) : setter(newState);
  };

  useEffect(subObs, () => input$.next(getter()));

  return [state, setState, input$]
}

function useRef(value) {
  const _input$ = resolveObservableState(value);
  const { state, input$ } = createState(_input$ ? _input$ : value, {
    noObserver: true
  });
  const setState = newState => {
    input$.next(isFunction(newState) ? newState(state()) : newState);
  };
  return [state, setState, input$]
}

export { Await, Fragment, Teleport, _jsx, createContext, createState, defineElement, hydrate, isVNode, render, useChildren, useComputed, useEffect, useMount, useRef, useState, useUpdate };
