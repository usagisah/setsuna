import { isArray, isPlainObject, isString } from "./type"

export const resolveEventName = name => {
  return name.startsWith("on") ? name.slice(2).toLocaleLowerCase() : name
}

/* <div style={{ color: "red" }} /> */
export const normalizeObjectStyle = styleObj => {
  return Object.keys(styleObj).reduce(
    (style, key) => (style += `${key}: ${styleObj[key]};`),
    ""
  )
}

/* <div class={{ "foo": true, "bar": false }} /> */
export const normalizeObjectClassName = classObj => {
  return Object.keys(classObj)
    .reduce((cl, key) => (cl += classObj[key] ? `${key} ` : ""), "")
    .trimEnd()
}

/* <div class={["foo", "bar"]} /> */
export const normalizeArrayClassName = classAry => {
  return classAry.filter(isString).join(" ").trimEnd()
}

export function normalizeElementProps(props) {
  return Object.keys(props).reduce((result, key) => {
    if (key === "style" && isPlainObject(props[key])) {
      result[key] = normalizeObjectStyle(props[key])
    } else if (key === "className" || key === "class") {
      const cl = props[key]
      if (isArray(cl)) {
        result[key] = normalizeArrayClassName(cl)
      } else if (isPlainObject(cl)) {
        result[key] = normalizeObjectClassName(cl)
      } else {
        result[key] = cl
      }
    } else if (key !== "key" && key !== "ref") {
      result[key] = props[key]
    }
    return result
  }, {})
}

export function identityComponent(message) {
  return () => console.error(message)
}

export const svgTags = {
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
}
