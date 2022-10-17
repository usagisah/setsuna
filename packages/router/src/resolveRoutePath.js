export function normalizeSlash(path) {
  if (path.endsWith("/")) {
    path = path.slice(0, -1)
  }

  if (!path.startsWith("/")) {
    path = "/" + path
  }

  return path
}

export function excludeQuery(path) {
  const anchor = path.indexOf("?")
  return anchor > -1 ? path.slice(0, anchor) : path
}

export function resolveRoutePath(path) {
  const paramKeys = []
  path = String(path)
  path = excludeQuery(path)
  path = normalizeSlash(path)

  if (path.includes("/:")) {
    let str = ""
    path.split("/").forEach(token => {
      if (token.startsWith(":")) {
        str += "/([^/]+)"
        paramKeys.push(token.slice(1))
      } else {
        str += `/${token}`
      }
    })
    path = str
  }

  return [path, paramKeys]
}
