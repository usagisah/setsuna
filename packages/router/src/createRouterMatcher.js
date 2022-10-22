import { parseRoutePath } from "./parseRoutePath"
import { isArray, isFunction, isPlainObject, isString } from "@setsuna/share"
import { error } from "./handler"

export function createRouterMatcher(router) {
  const { routes } = router.options
  if (!isArray(routes)) {
    return {}
  }

  const matcher = new Map()
  routes.forEach(route => createRouteMatcher({ route, deep: 0, matcher }))
  return (router.matcher = {
    resolve: key => {
      let res = matcher.get(key)
      if (res) {
        return res
      }

      matcher.forEach(s => {
        if (!res && s.match.test(key.slice(1, -1))) {
          res = s
        }
      })
      return res
    },
    resolveRecordMatcher: record => {
      if (!record.matchState) {
        return []
      }

      const state = matcher.get(record.matchState.matchPath)
      const matchs = []
      let curState = state
      while (curState) {
        matchs.push(curState)
        curState = curState.parent
      }

      return matchs.reverse()
    }
  })
}

export function createRouteMatcher({ route, deep, matcher, parent }) {
  if (!isPlainObject(route)) {
    return
  }

  const { path, redirect, loader, children } = route
  if (!isString(path) || !path) {
    return
  }

  const [_path, paramKeys] = parseRoutePath(path)
  const _regPath = deep === 0 ? _path : `${parent.matchPath}${_path}`

  const _route = {
    matchPath: _regPath,
    match: "",
    loader,
    loaderData: {
      value: Promise.resolve()
    },
    paramKeys,
    redirect,
    parent,
    children: [],
    options: route
  }

  if (loader && !isFunction(loader)) {
    _route.loader = null
    error("loader", "route loader is not a function", loader)
  }

  if (Array.isArray(children)) {
    children.forEach(cRoute =>
      createRouteMatcher({
        route: cRoute,
        deep: deep + 1,
        matcher,
        parent: _route
      })
    )
  }

  const regPath = `^${_regPath}$`
  _route.matchPath = regPath
  _route.match = new RegExp(regPath)

  matcher.set(regPath, _route)
}
