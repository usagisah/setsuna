import { callWithErrorHandler } from "../../../handler/callWithErrorHandler"
import { unmount } from "../../unmount"

export function unmountComponent(node) {
  const { update, _c: c } = node
  const { observable, context, unmounts, subTree, parentComponent } = c

  update.active = false
  if (parentComponent) {
    parentComponent.deps.delete(update)
  }

  observable.forEach(input$ => {
    callWithErrorHandler(node, () => input$.complete())
  })
  Object.values(context).forEach(({ input$ }) => {
    callWithErrorHandler(node, () => input$.complete())
  })

  if (subTree) {
    unmount(subTree)
  }

  unmounts.forEach(fn => callWithErrorHandler(node, fn))
  c.container = c.VNode.el = null
}
