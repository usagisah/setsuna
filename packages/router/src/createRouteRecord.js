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
  return {
    loc: pathTmpl,
    matchState,
    state: {
      fullPath: "",
      path,
      redirect: matchState && matchState.redirect,
      query,
      params
    },
    matchs: []
  }
}
