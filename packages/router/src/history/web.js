import { EMPTY_RECORD } from "../createRouteRecord"
import {
  excludeQuery,
  normalizeSlash,
  resolveRoutePath
} from "../resolveRoutePath"

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
    history.go(-1)
  }

  function forward() {
    history.go(1)
  }

  function setLocation(record, replace) {
    const href = buildLocationHref(router, record.path)
    const hisState = buildHistoryState(record)
    record.href = href
    state.location = record
    history[replace ? "replaceState" : "pushState"](hisState, "", href)
  }

  function onPopstateEvent(e) {
    console.log(e)
  }

  function destory() {
    window.removeEventListener("popstate", onPopstateEvent)
  }

  window.addEventListener("popstate", onPopstateEvent)

  router.his = {
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

function normalizeBase(basePath) {
  let base = basePath ? String(basePath) : ""
  base = base.replace(/^\w+:\/+/, "").replace(/\/?#/, "")
  base = excludeQuery(base)
  base = normalizeSlash(base)

  if (base === "/") {
    base = ""
  }

  return base
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
    matchs: resolveRecordMatcher(matchPath)
  })
}

function buildHistoryState(record) {
  const { fullPath, path, params, query } = record
  return { setsuna_router: { fullPath, path, params, query } }
}

function buildLocationHref(router, path) {debugger
  const { type, his } = router
  const { base } = his.state
  const { hash, pathname, search } = location

  if (type === "hash") {
    const hashPath = hash[1] === "/" ? hash.slice(1) : `/${hash.slice(1)}`
    const basePath = hashPath.startsWith(base) ? "" : base
    if (hashPath.endsWith(path)) {
      path = ""
    }
    path = pathname + search + "/#" + basePath + hashPath + path
  } else {
    const fullPath = pathname.startsWith(base) ? pathname : base + pathname
    if (fullPath.endsWith(path)) {
      path = ""
    }
    path = removeSlash(fullPath) + path + search
  }

  return path
}

export function removeSlash(path) {
  if (path.endsWith("/")) {
    path = path.slice(0, -1)
  }
  return path
}
