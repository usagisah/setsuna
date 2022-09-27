'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function warnLog(type, message) {
  return console.warn(`[Observable ${type} warn]: ${message}`)
}
function errLog(type, ...message) {
  return console.error(`[Observable ${type} has error]: ${message.join("\n")}`)
}
function noop(value) {
  return value
}
function noopError(error) {
  throw error
}

function normalizeOps(ops) {
  return ops.reduce((result, op) => {
    if (typeof op === "function") {
      result.push({ next: op, error: noopError, complete: noop });
    } else if (typeof op === "object") {
      result.push({
        next: op.next ?? noop,
        error: op.error ?? noopError,
        complete: op.complete ?? noop
      });
    } else {
      errLog("pipe", "非法的管道操作符", op);
    }
    return result
  }, [])
}
function normalizeSubs(sub) {
  if (typeof sub === "function") {
    return { next: sub }
  }
  if (typeof sub === "object") {
    return sub
  }
  errLog("subscribe", "非法的订阅函数", sub);
}

const RETURN = {
  SKIP: "_ob_return_skip",
  LOOP: "_ob_return_loop"
};

/* 
  1. 存在 pipe 用于挂载管道链
  2. 存在 subscribe 用户订阅上层推送的值
  3. subscribe 需要返回一个能取消订阅的函数
  4. 如果 closed() 函数用于，同步获取当前是否停止的 布尔值
  5. 存在 next 方法，用于推送正常值
  6. 存在 error 方法，用户推送异常值
  7. complete 方法，用于结束结束流的推送

  判断是否一个流
  是对象
  存在 pipe 方法
  存在 subscribe 方法

  基本使用
  const oo = new Observable()
  oo.pipe(fn1, fn2, fn3)
  ob.subscribe(fn)

  pipe
  写法
  1. pipe( value => newValue )
  2. pipe(
    next: value => newValue,
    error: error => { throw error },
    complete: () => null
  )
  行为同 promise，如果返回值是 promise 会透传
  如果错误流中，解决了会回到正常流，抛出错误则相当于透传

  subscribe
  写法
  1. pipe( value => newValue )
  2. pipe(
    next: value => newValue,
    error: error => { throw error },
    complete: () => null
  )
*/
class Observable {
  #ops = []
  #subs = []
  #closed = false

  get closed() {
    return this.#closed
  }

  constructor(ob) {
    if (ob && isObservable(ob)) {
      ob.subscribe({
        next: nextValue => this.next(nextValue),
        error: nextError => this.error(nextError),
        complete: () => this.complete()
      });
    } else if (ob !== undefined) {
      warnLog("constructor", `${ob} is not Observable`);
    }
  }

  pipe(...operators) {
    this.#closed
      ? warnLog("pipe", "流已经被关闭，添加管道操作无效")
      : this.#ops.push(...normalizeOps(operators));
    return this
  }

  subscribe(sub) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    const _sub = normalizeSubs(sub);
    this.#subs.push(_sub);
    return function unSubscribe() {
      const index = this.#subs.indexOf(_sub);
      index > -1 && this.#subs.splice(index, 1);
    }
  }

  next(value) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    this.#callWithOperates("next", value);
  }

  error(error) {
    if (this.#closed) {
      return warnLog("pipe", "流已经被关闭，添加管道操作无效")
    }
    this.#callWithOperates("error", error);
  }

  complete() {
    if (this.#closed) {
      return
    }
    this.#closed = true;
    this.#callWithOperates("complete");
  }

  async #callWithOperates(type, value) {
    const originType = type;
    const originValue = value;

    for (const op of this.#ops) {
      try {
        let _value = op[type](value);

        if (_value instanceof Promise) {
          _value = await _value;
        }
        if (_value === RETURN.SKIP) {
          break
        }
        if (_value === RETURN.LOOP) {
          this.#callWithOperates(originType, originValue);
          break
        }
        if (type !== "complete") {
          type = "next";
          value = _value;
        }
      } catch (error) {
        if (type === "complete") {
          errLog("complete", "", op[type]);
        } else {
          type = "error";
          value = error;
        }
      }
    }

    this.#callWithSubscribes(type, value);
  }

  async #callWithSubscribes(type, value) {
    const subs = this.#subs.reduce(
      (subs, sub) => (type in sub && subs.push(sub[type]), subs),
      []
    );

    if (subs.length === 0 && type === "error") {
      return errLog("subscribe", "执行过程存在未处理的错误", value)
    }

    for (const sub of subs) {
      try {
        sub(value);
      } catch (e) {
        errLog("subscribe", `${sub.name}(${value})`, e);
      }
    }
  }
}

function isObservable(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.pipe === "function" &&
    typeof value.subscribe === "function"
  )
}

function defineLazyObservable(fn = () => null, value) {
  if (typeof fn !== "function") {
    throw Error("[defineLazyObservable error]: `fn`不是一个合法的函数\n", fn)
  }
  const input$ = new Observable(value);
  const _subscript = input$.subscribe.bind(input$);
  input$.subscribe = function subscribe(sub) {
    _subscript(sub);
    fn(input$);
  };
  return input$
}

function isFunction(value) {
  return typeof value === "function"
}

function isString(value) {
  return typeof value === "string"
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]"
}

const isArray = Array.isArray;

function isPromise(value) {
  return (
    value instanceof Promise &&
    isFunction(value.then) &&
    isFunction(value.catch)
  )
}

/* <div style={{ color: "red" }} /> */
const normalizeObjectStyle = styleObj => {
  return Object.keys(styleObj).reduce(
    (style, key) => (style += `${key}: ${styleObj[key]};`),
    ""
  )
};

/* <div class={{ "foo": true, "bar": false }} /> */
const normalizeObjectClassName = classObj => {
  return Object.keys(classObj)
    .reduce((cl, key) => (cl += classObj[key] ? `${key} ` : ""), "")
    .trimEnd()
};

/* <div class={["foo", "bar"]} /> */
const normalizeArrayClassName = classAry => {
  return classAry.filter(isString).join(" ").trimEnd()
};

function normalizeElementProps(props) {
  return Object.keys(props).reduce((result, key) => {
    if (key === "style" && isPlainObject(props[key])) {
      result[key] = normalizeObjectStyle(props[key]);
    } else if (key === "className" || key === "class") {
      const cl = props[key];
      if (isArray(cl)) {
        result[key] = normalizeArrayClassName(cl);
      } else if (isPlainObject(cl)) {
        result[key] = normalizeObjectClassName(cl);
      } else {
        result[key] = cl;
      }
    } else if (key !== "key" && key !== "ref") {
      result[key] = props[key];
    }
    return result
  }, {})
}

function identityComponent(message) {
  return () => console.error(message)
}

function resolveObservableState(value) {
  return isObservable(value)
    ? value
    : (isFunction(value) || isPlainObject(value)) && isObservable(value.input$)
    ? value.input$
    : undefined
}

const omit = (source, blackList) =>
  Object.keys(source).reduce((result, key) => {
    !blackList.includes(key) && (result[key] = source[key]);
    return result
  }, {});

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

exports.renderToStream = renderToStream;
exports.renderToString = renderToString;
