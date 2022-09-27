import { createElement } from "../../../node/nodeOpts"
import { normalizeElementProps } from "@setsuna/share"
import { omit } from "@setsuna/share"
import { isFunction } from "@setsuna/share"

export function normalizeElementNode(node, create) {
  const { type, props, children } = node
  const tag = isFunction(type) ? type.displayName : type
  return (node._e = {
    el: create ? createElement(tag, props) : null,
    tag,
    ref: props.ref,
    attrs: normalizeElementProps(omit(props, "ref")),
    children,
    VNode: node
  })
}
