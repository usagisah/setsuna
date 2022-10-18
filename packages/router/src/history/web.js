import { isPlainObject, isString } from "@setsuna/share"
import { normalizeSlash, resolveRoutePath } from "../parseRoutePath"
import { excludeQuery, parseLocation } from "../parseLocation"
import { createRouteRecord, EMPTY_RECORD } from "../createRouteRecord"
import { stringify } from "querystring"

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
    const { base, path, pathname, search, hash, query } = record.loc
    let href, fullPath
    if (router.type === "hash") {
      href = base + pathname + search + hash + stringify(query)
      fullPath = base + pathname + search + hash
    } else {
      href = base + path + stringify(query) + "/#/" + hash
      fullPath = base + path + "/#/" + hash
    }

    history[replace ? "replaceState" : "pushState"](
      (record.state = fullPath),
      "",
      href
    )
    state.location = record
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

export function normalizeNavState(state) {
  if (isString(state)) {
    return {
      path: state,
      query: {}
    }
  } else {
    return {
      path: state.path || "",
      query: isPlainObject(state, query) || {}
    }
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

  return {
    value: base,
    reg: new RegExp(`(^${base}$)|(^${base}/\w+)`)
  }
}

function normalizeLocation(router) {
  const { state } = history
  if (!state || !state.setsuna_router) {
    return EMPTY_RECORD
  }

  return createRouteRecord(parseLocation(state.setsuna_router), router)
}