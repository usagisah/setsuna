import { patch } from "./patch/patch"

export function render(VNode, container) {
  patch({
    oldVNode: null,
    newVNode: VNode,
    container,
    anchor: null,
    parentComponent: null,
    deep: false,
    hydrate: false
  })
}

export function hydrate(VNode, container) {
  patch({
    oldVNode: null,
    newVNode: VNode,
    container,
    anchor: null,
    parentComponent: null,
    deep: false,
    hydrate: true,
    hydrateNode: null
  })
}
