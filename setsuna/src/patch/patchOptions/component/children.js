import { patchFragment } from "../fragment/patchFragment"

export function patchSlot(context) {
  const { parentComponent, VNode, slot } = context.parentComponent
  parentComponent.deps.add(VNode.update)
  context.newVNode.children = slot
  return patchFragment(context)
}
