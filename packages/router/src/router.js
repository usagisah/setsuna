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

  createRouterMatcher(router)
  createHistory(router)

  callEffectNavigate(router, parseHrefToPath(router), record => {
    router.history.setLocation(record, false)
  })

  return router
}

function parseHrefToPath(router) {
  const { type, history } = router
  const base = history.state.base + "/"
  const { hash, pathname, search } = location
  let path = ""

  if (type === "hash") {
    path = hash.includes(base)
      ? hash.slice(hash.indexOf(base) + base.length)
      : ""
  } else {
    const _pathname = pathname.includes(base)
      ? pathname.slice(pathname.indexOf(base) + base.length)
      : ""
    path = _pathname + search + hash
  }

  return `/${path}`
}
