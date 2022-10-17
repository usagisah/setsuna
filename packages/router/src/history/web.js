import { EMPTY_RECORD } from "../createRouteRecord"
import { normalizeSlash, resolveRoutePath } from "../resolveRoutePath"

export function createWebHistory(router) {
  const state = {
    base: normalizeBase(router.options.base),
    location: normalizeLocation(router)
  }

  function push(to, options = {}) {
    const matchPath = normalizeRoutePath(to)
    if (!options.force && matchPath === state.state.matchPath) {
      return
    }

    // 基于当前
    const record = createRouteRecord(to)
    callEffectNavigate(router, record, (record, matcher) => {
      setLocation(record, matcher, "push")
    })
  }

  function replace(to, options) {
    const matchPath = normalizeRoutePath(to)
    if (!options.force && matchPath === state.state.matchPath) {
      return
    }

    // 基于当前
    const record = createRouteRecord(to)
    callEffectNavigate(router, (record, matcher) => {
      setLocation(record, matcher, "replace")
    })
  }

  function go(delta) {
    history.go(delta)
  }

  function back() {
    history.go(1)
  }

  function forward() {
    history.go(1)
  }

  function setLocation(record, replace) {
    state.location = record
    history[replace ? "replace" : "pushState"](
      buildHistoryState(record),
      "",
      buildLocationHref(router, record.path)
    )
  }

  function onPopstateEvent(e) {
    console.log(e)
  }

  function destory() {
    window.removeEventListener("popstate", onPopstateEvent)
  }

  window.addEventListener("popstate", onPopstateEvent)

  router.history = {
    state,
    navigator: {
      push,
      replace,
      go,
      back,
      forward
    },
    setLocation,
    destory
  }
}

function normalizeBase(router) {
  let base = String(router.base || "")

  // 去协议，例如 http(s):// file:///
  base = base.replace(/^\w+:\/+/, "")

  // 去 query 参数
  const anchor = base.indexOf("?")
  if (anchor > -1) {
    base = base.slice(0, anchor)
  }

  return normalizeSlash(base)
}

function normalizeLocation(router) {
  const { resolve, resolveRecordMatcher } = router.matcher
  const { state } = history
  if (!state || !state.setsuna_router) {
    return EMPTY_RECORD
  }

  const location = state.setsuna_router
  const matchPath = "^" + resolveRoutePath(location.path)[0] + "$"
  return Object.assign(location, {
    state: resolve(matchPath),
    matchPath,
    matchs: resolveRecordMatcher()
  })
}

function buildHistoryState(record) {
  const { fullPath, path, params, query } = record
  return { setsuna_router: { fullPath, path, params, query } }
}

function buildLocationHref(router, path) {
  const { type, history } = router
  const { base } = history.state
  const { hash, pathname, search } = location

  if (type === "hash") {
    const hashPath = hash[1] === "/" ? hash : `#/${hash.slice(1)}`
    const basePath = hashPath.endsWith(base) ? "" : base
    path = pathname + search + hashPath + removelastSlash(basePath + path)
  } else {
    const fullPath = pathname.endsWith(base) ? pathname : pathname + base
    path = removelastSlash(fullPath + path) + search
  }

  return path
}

function removelastSlash(path) {
  return path.endsWith("/") ? path.slice(0, -1) : path
}
