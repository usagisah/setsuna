import { resolveRoutePath } from "./resolveRoutePath"

export const EMPTY_RECORD = {
  fullPath: "",
  path: "",
  query: {},
  params: {},
  matchPath: "",
  matchs: [],
  matcher: null
}

export function createRouteRecord(path, router) {
  const { matcher, history } = router
  const matchPath = "^" + resolveRoutePath(path)[0] + "$"
  const state = matcher.resolve(matchPath)
  return state
    ? transformStateToRecord(state, history)
    : EMPTY_RECORD
}

function transformStateToRecord(state, history) {
  const { search, pathname } = location
  const { path, matchPath, match, paramKeys } = state

  const query = {}
  const searchExp = search.slice(1).split("&")
  for (let index = 0; index < searchExp.length; index++) {
    const exp = searchExp[index]
    if (!exp) {
      continue
    }

    const [key, value] = exp.split("=")
    if (!key) {
      continue
    }

    query[decodeURIComponent(key)] = decodeURIComponent(value) || ""
  }

  const params = {}
  const res = pathname.match(match)
  paramKeys.forEach((key, index) => {
    params[key] = decodeURIComponent(res[index + 1])
  })

  return {
    fullPath: history.state.base + path,
    path,
    params,
    query,
    matchPath,
    matchs: [],
    matcher: state,
  }
}
