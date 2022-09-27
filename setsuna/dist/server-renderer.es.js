import { identityComponent, isPlainObject, isPromise, isFunction, isArray, omit, normalizeElementProps, resolveObservableState, isString } from '@setsuna/share';
import { defineLazyObservable } from '@setsuna/observable';

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

function pipeNormalizeRenderContext(VNode) {
  if (!isVNode(VNode)) {
    throw Error(
      `[renderToString error]: 该参数接收一个 VNode 节点，但却接到了`,
      VNode
    )
  }
  return { VNode, parentComponent: null }
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
const setCurrentInstance = ins => {
  return ins ? activeComponentContext.push(ins) : activeComponentContext.pop()
};

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

const Await = identityComponent("Suspense 为内部组件，禁止直接使用");

const Teleport = identityComponent("Teleport 为内部组件，禁止直接使用");

const ignoreElement = new WeakMap();

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

const pipeNodeToString = nodeToString;

const pipeMergeBuffNodes = mergeBuffNodes;

async function mergeBuffNodes(treeNodes) {
  let buff = "";
  for (const node of treeNodes) {
    if (isString(node)) {
      buff += node;
    } else if (isArray(node)) {
      buff += await mergeBuffNodes(node);
    } else if (isPromise(node)) {
      const _node = await node;
      buff += await mergeBuffNodes(_node);
    } else {
      error$1("hydrating", "未知的合并节点类型", [node]);
    }
  }
  return buff
}

function renderToString() {
  return defineLazyObservable().pipe(
    pipeNormalizeRenderContext,
    pipeNodeToString,
    pipeMergeBuffNodes
  )
}

const pipePipeBuffToStream = pipeBuffToStream;

function pipeBuffToStream(stream) {
  return async function _pipeBuffToStream(treeNodes) {
    for (const node of treeNodes) {
      if (isString(node)) {
        stream.push(node);
      } else if (isArray(node)) {
        await _pipeBuffToStream(node);
      } else if (isPromise(node)) {
        const _node = await node;
        await _pipeBuffToStream(_node);
      } else {
        error("hydrating", "未知的合并节点类型", [node]);
      }
    }
  }
}

function renderToStream(stream, pipes = []) {
  return defineLazyObservable().pipe(
    pipeNormalizeRenderContext,
    pipeNodeToString,
    pipePipeBuffToStream(stream),
    ...pipes,
    () => stream.push(null)
  )
}

export { renderToStream, renderToString };
