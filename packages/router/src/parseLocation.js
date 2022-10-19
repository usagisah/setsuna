import { parseRoutePath } from "./parseRoutePath"

export function parseLocation(pathExp, router) {
  const { type, his, matcher } = router
  const { base } = his.state
  const loc = {
    base: base.value,
    path: "",
    pathname: "",
    search: "",
    hash: "",
    query: {},
    params: {},
    matchPath: "",
    matchState: null,
    position: null
  }
  const { pathname, search, hash } = location
  let _path = ""

  if (!pathExp) {
    if (type === "hash") {
      loc.pathname = pathname
      loc.search = search
      loc.hash = normalizeHashPath(excludeQuery(hash))
      loc.query = parseQuery(loc.hash)
      _path = loc.hash
    } else {
      loc.pathname = pathname
      loc.search = ""
      loc.hash = hash
      loc.query = parseQuery(search)
      _path = pathname
    }
  } else {
    const { path, query, position } = pathExp
    loc.position = position
    
    if (type === "hash") {
      loc.pathname = pathname + search
      loc.search = ""
      loc.hash = normalizeHashPath(excludeQuery(path))
      loc.query = parseQuery(path)
      _path = loc.hash
    } else {
      loc.pathname = ""
      loc.search = ""
      loc.hash = ""
      loc.query = { ...parseQuery(path), ...query }
      _path = excludeQuery(path)
    }
  }

  if (base.reg.test(_path)) {
    _path = _path.slice(base.value.length)
  }

  const [matchPath] = parseRoutePath(_path)
  const matchState = matcher.resolve(`^${matchPath}$`)
  if (matchState) {
    const res = _path.match(matchState.match)
    if (res) {
      loc.params = matchState.paramKeys.reduce((params, key, index) => {
        params[key] = decodeURIComponent(res[index + 1])
        return params
      }, {})
    }
  }

  loc.matchPath = matchPath
  loc.matchState = matchState
  loc.path = _path
  return loc
}

export function excludeQuery(path) {
  return path.includes("?") ? path.slice(0, path.indexOf("?")) : path
}

export function normalizeHashPath(hash) {
  hash = hash.slice(1)
  if (!hash.startsWith("/")) {
    hash = "/" + hash
  }
  return hash
}

export function parseQuery(path) {
  const anchor = path.indexOf("?")
  if (anchor === -1) {
    return {}
  }

  path = path.slice(anchor + 1)
  return path.split("&").reduce((query, str) => {
    const [key, value] = str.split("=")
    if (key) {
      query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ""
    }

    return query
  }, {})
}
