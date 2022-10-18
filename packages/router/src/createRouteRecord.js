export const EMPTY_RECORD = {
  loc: null,
  matchState: null,
  state: {
    fullPath: "",
    path: "",
    redirect: null,
    query: {},
    params: {}
  }
}

export function createRouteRecord(pathTmpl) {
  const { path, query, params, matchState } = pathTmpl
  const { redirect } = matchState
  return {
    loc: pathTmpl,
    matchState,
    state: {
      fullPath: "",
      path,
      redirect,
      query,
      params
    }
  }
}
