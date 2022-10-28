export function normalizeSlash(path) {
  if (path.endsWith("/")) {
    path = path.slice(0, -1)
  }

  if (!path.startsWith("/")) {
    path = "/" + path
  }

  return path
}

export function parseRoutePath(path) {
  const paramKeys = []
  path = String(path)
  path = normalizeSlash(path)

  if (path.includes("/:")) {
    let str = ""
    path
      .slice(1)
      .split("/")
      .forEach(token => {
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
