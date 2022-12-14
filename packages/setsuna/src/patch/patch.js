import { Await } from "../components/Await"
import { Fragment } from "../components/Fragment"
import { Teleport } from "../components/Teleport"
import { isFunction, isSomeVNode, isString } from "@setsunajs/share"
import { patchAwait } from "./patchOptions/await/patchAwait"
import { patchSlot } from "./patchOptions/component/children"
import { patchComponent } from "./patchOptions/component/patchComponent"
import { ignoreElement } from "./patchOptions/element/ignoreElement"
import { patchElement } from "./patchOptions/element/patchElement"
import { patchFragment } from "./patchOptions/fragment/patchFragment"
import { patchTeleport } from "./patchOptions/teleport/patchTeleport"
import { patchTextElement } from "./patchOptions/text/patchTextElement"
import { unmount } from "./unmount"

export function patch(patchContext) {
  const { oldVNode, newVNode } = patchContext

  if (Object.is(oldVNode, newVNode)) {
    return
  }

  if (oldVNode && !isSomeVNode(oldVNode, newVNode)) {
    patchContext.anchor = oldVNode.anchor
    unmount(oldVNode)
    patchContext.oldVNode = null
  }

  const type = newVNode.type
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
