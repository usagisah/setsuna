import { isPlainObject, isString } from "@setsuna/share"
import { normalizeSlash } from "../parseRoutePath"
import { excludeQuery, parseLocation } from "../parseLocation"
import { createRouteRecord, EMPTY_RECORD } from "../createRouteRecord"
import { callEffectNavigate } from "../effect/callEffectNavigate"

export function createWebHistory(router) {
  const state = {
    base: normalizeBase(router.options.base),
    location: null
  }

  function navigate(to, replace) {
    const options = normalizeNavState(to)
    if (!isString(options.path)) {
      return console.error("push error: path is not a string")
    }

    if (!options.force && state.location.loc.path === options.path) {
      return
    }

    callEffectNavigate(
      parseLocation(normalizeNavState(options), router),
      router,
      record => {
        router.his.setLocation(record, replace)
      }
    )
  }

  function push(to) {
    navigate(to, false)
  }

  function replace(to) {
    navigate(to, true)
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
      href = base + pathname + search + "/#" + hash + queryString(query)
      fullPath = base + pathname + search + hash
    } else {
      href = base + path + queryString(query) + hash
      fullPath = base + path + hash
    }

    record.state.fullPath = fullPath
    history[replace ? "replaceState" : "pushState"](
      { setsuna_router: record.state },
      "",
      href
    )
    state.location = record
  }

  function onPopstateEvent() {
    callEffectNavigate(parseLocation(null, router), router, record => {
      router.his.setLocation(record, replace)
    })
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
  state.location = normalizeLocation(router)
}

export function normalizeNavState(state) {
  if (isString(state)) {
    return {
      path: state,
      query: {},
      force: false
    }
  } else {
    return {
      path: state.path,
      query: isPlainObject(state.query) || {},
      force: !!state.force
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
    reg: new RegExp(`(^${base}$)|(^${base}/[\\s\\S]+)`)
  }
}

function normalizeLocation(router) {
  const { state } = history
  if (!state || !state.setsuna_router) {
    return EMPTY_RECORD
  }

  const record = createRouteRecord(parseLocation(state.setsuna_router, router), router)
  record.state.position = record.loc.position
  return record
}

function queryString(query) {
  let tokens = []
  Object.entries(query).forEach(([key, value]) => {
    let exp = ""
    if (key) {
      exp = key
    }
    if (value) {
      exp += "=" + value
    }
    if (exp.length > 0) {
      tokens.push(exp)
    }
  })
  return (tokens.length > 0 ? "?" : "") + tokens.join("&")
}
