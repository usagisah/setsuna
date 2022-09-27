import { patch } from "../patch/patch"
import { _jsx } from "../jsx"

if (!globalThis?.window?.__SETSUNA_HMR_MAP__) {
  globalThis.window.__SETSUNA_HMR_MAP__ = {
    invokeReload
  }
}

const records = new Map()

export function registryRecord(id, renderEffect) {
  let record = records.get(id)
  if (!record) {
    records.set(id, (record = { deps: new Set() }))
  }

  record.deps.add(renderEffect)
}

export function invokeReload(id, App) {
  const appRecord = records.get(id)
  const deps = [...appRecord.deps]
  appRecord.deps.clear()
  deps.forEach(renderEffect => {
    const { c, active } = renderEffect
    if (!active) return

    const { VNode, parentComponent, container } = c
    const newVNode = _jsx(App, VNode.props, ...VNode.children)
    patch({
      oldVNode: VNode,
      newVNode,
      container,
      anchor: VNode.anchor,
      parentComponent,
      deep: false,
      hydrate: false
    })

    Object.assign(VNode, newVNode)
    c.VNode = VNode
  })
}
