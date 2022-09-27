'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isFunction(value) {
  return typeof value === "function"
}

function isString(value) {
  return typeof value === "string"
}

function isBoolean(value) {
  return typeof value === "boolean"
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]"
}

function isObject(value) {
  return typeof value === "object"
}

const isArray = Array.isArray;

function isUndefined(value) {
  return value === void 0
}

function isNumber(value) {
  return typeof value === "number"
}

function isPromise(value) {
  return (
    value instanceof Promise &&
    isFunction(value.then) &&
    isFunction(value.catch)
  )
}

function isSomeVNode(n1, n2) {
  return Object.is(n1.type, n2.type) && Object.is(n1.key, n2.key)
}

const resolveEventName = name => {
  return name.startsWith("on") ? name.slice(2).toLocaleLowerCase() : name
};

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

const svgTags = {
  svg: true,
  animate: true,
  animateMotion: true,
  animateTransform: true,
  circle: true,
  clipPath: true,
  "color-profile": true,
  defs: true,
  desc: true,
  discard: true,
  ellipse: true,
  feBlend: true,
  feColorMatrix: true,
  feComponentTransfer: true,
  feComposite: true,
  feConvolveMatrix: true,
  feDiffuseLighting: true,
  feDisplacementMap: true,
  feDistanceLight: true,
  feDropShadow: true,
  feFlood: true,
  feFuncA: true,
  feFuncB: true,
  feFuncG: true,
  feFuncR: true,
  feGaussianBlur: true,
  feImage: true,
  feMerge: true,
  feMergeNode: true,
  feMorphology: true,
  feOffset: true,
  fePointLight: true,
  feSpecularLighting: true,
  feSpotLight: true,
  feTile: true,
  feTurbulence: true,
  filter: true,
  foreignObject: true,
  g: true,
  hatch: true,
  hatchpath: true,
  image: true,
  line: true,
  linearGradient: true,
  marker: true,
  mask: true,
  mesh: true,
  meshgradient: true,
  meshpatch: true,
  meshrow: true,
  metadata: true,
  mpath: true,
  path: true,
  pattern: true,
  polygon: true,
  polyline: true,
  radialGradient: true,
  rect: true,
  set: true,
  solidcolor: true,
  stop: true,
  switch: true,
  symbol: true,
  text: true,
  textPath: true,
  title: true,
  tspan: true,
  unknown: true,
  use: true,
  view: true
};

function isObservable(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.pipe === "function" &&
    typeof value.subscribe === "function"
  )
}

function resolveObservableState(value) {
  return isObservable(value)
    ? value
    : (isFunction(value) || isPlainObject(value)) && isObservable(value.input$)
    ? value.input$
    : undefined
}

function resolveNextNodes(el, flag) {
  const open = [];
  const nextNodes = [el];
  let next = getNextSibling(el);
  while (next) {
    nextNodes.push(next);

    if (next.nodeType != 8) {
      next = getNextSibling(next);
      continue
    }

    const content = next.textContent.trim();
    if (content === `/${flag}`) {
      if (open.length === 0) {
        return nextNodes
      } else {
        open.pop();
      }
    }
    next = getNextSibling(next);
  }
}

const omit = (source, blackList) =>
  Object.keys(source).reduce((result, key) => {
    !blackList.includes(key) && (result[key] = source[key]);
    return result
  }, {});

const noop = value => value;

const noopError = error => { throw error };

const def = (target, key, options) => Object.defineProperty(target, key, {
  enumerable: false,
  configurable: false,
  ...options
});

exports.def = def;
exports.identityComponent = identityComponent;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isFunction = isFunction;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isPlainObject = isPlainObject;
exports.isPromise = isPromise;
exports.isSomeVNode = isSomeVNode;
exports.isString = isString;
exports.isUndefined = isUndefined;
exports.noop = noop;
exports.noopError = noopError;
exports.normalizeArrayClassName = normalizeArrayClassName;
exports.normalizeElementProps = normalizeElementProps;
exports.normalizeObjectClassName = normalizeObjectClassName;
exports.normalizeObjectStyle = normalizeObjectStyle;
exports.omit = omit;
exports.resolveEventName = resolveEventName;
exports.resolveNextNodes = resolveNextNodes;
exports.resolveObservableState = resolveObservableState;
exports.svgTags = svgTags;
