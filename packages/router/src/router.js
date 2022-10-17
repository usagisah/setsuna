import { isFunction } from "@setsuna/share"
import { createRouterMatcher } from "./createRouterMatcher"
import { callEffectNavigate } from "./effect/callEffectNavigate"
import { createHashHistory } from "./history/hash"
import { createMemoryHistory } from "./history/memory"
import { createWebHistory } from "./history/web"

export function createBrowserRouter(options) {
  return createRouter("history", options, createWebHistory)
}

export function createHashRouter(options) {
  return createRouter("hash", options, createHashHistory)
}

export function createMemoryRouter(options) {
  return createRouter("memory", options, createMemoryHistory)
}

const DEFAULT_GUARD = () => true

function createRouter(type, options, createHistory) {
  const { beforeEnter, afterEnter } = options
  const router = {
    type,
    beforeEnter: isFunction(beforeEnter) ? beforeEnter : DEFAULT_GUARD,
    afterEnter: isFunction(afterEnter) ? afterEnter : DEFAULT_GUARD,
    options
  }

  debugger
  createRouterMatcher(router)
  createHistory(router)
  callEffectNavigate(router, parseHrefToPath(router), record => {
    router.his.setLocation(record, true)
  })

  return router
}

function parseHrefToPath(router) {
  const { type, his } = router
  const base = his.state.base
  const { hash, pathname, search } = location
  let path = ""

  if (type === "hash") {
    let _hash = hash.slice(1)
    if (!_hash.startsWith("/")) _hash = "/" + _hash
    path = _hash.startsWith(base)
      ? _hash.slice(base.length)
      : _hash
  } else {
    const _pathname = pathname.startsWith(base)
      ? pathname.slice(base.length)
      : pathname
    path = _pathname + search + hash
  }

  return path.startsWith("/") ? path : `/${path}`
}
