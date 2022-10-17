import { resolveRoutePath } from "./resolveRoutePath"
import { isArray, isPlainObject, isString } from "@setsuna/share"

export function createRouterMatcher(router) {
  const { routes } = router.options
  if (!isArray(routes)) {
    return {}
  }

  const matcher = new Map()
  routes.forEach(route => createRouteMatcher({ route, deep: 0, matcher }))

  return (router.matcher = {
    resolve: key => matcher.get(key),
    resolveRecordMatcher: record => {
      if (!record) {
        return []
      }

      const state = matcher.get(record.matchPath)
      const matchs = []
      let curState = state
      while (curState) {
        matchs.push(curState)
        curState = state.parent
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

  const [_path, paramKeys] = resolveRoutePath(path)
  const _reg = deep === 0 ? _path : `${parent.matchPath}${_path}`
  const _route = {
    matchPath: _reg,
    match: "",
    loader,
    paramKeys,
    redirect,
    matchRedirect: redirect && resolveRoutePath(redirect).matchPath,
    loaderData: void 0,
    parent,
    children: [],
    options: route
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

  const reg = `^${_reg}$`
  _route.matchPath = reg
  _route.match = new RegExp(reg)
  matcher.set(reg, _route)
}
