import {
  createBrowserRouter as _createBrowserRouter,
  useRouter
} from "./router"
import { Observable } from "@setsunajs/observable"
import {
  nextTick,
  useComputed,
  useContext,
  useEffect,
  useMount,
  useProvide,
  useState,
  _jsx
} from "@setsunajs/setsuna"
import { isFunction } from "@setsunajs/share"
import { error } from "./handler"

const INJECT_ROUTE_VIEW = "setsuna route view"
const INJECT_ROUTE_ORDER = "setsuna route order"

export * from "./router"

export function useRoute() {
  const order = useContext(INJECT_ROUTE_ORDER)
  return useComputed([order], () => useRouter().his.state.location.state)
}

export function useLoaderData() {
  const views = useContext(INJECT_ROUTE_VIEW)
  const order = useContext(INJECT_ROUTE_ORDER)
  const [data, setData] = useState()
  let unmounted = false

  useMount(() => {
    return () => (unmounted = true)
  })

  views()[order() - 1].loaderData.value.then(data => {
    if (!unmounted) {
      setData(isFunction(data) ? () => data : data)
    }
  })

  return data
}

export function useRouterView() {
  const views = useContext(INJECT_ROUTE_VIEW)
  const order = useContext(INJECT_ROUTE_ORDER)
  const [_, setOrder] = useProvide(INJECT_ROUTE_ORDER, order() + 1)
  const [component, setComponent] = useState(() => {
    const route = views()[order()]
    return route ? route.options.component : null
  })

  useEffect([views], () => {
    const route = views()[order()]
    setComponent(route ? route.options.component : null)
    setOrder(order() + 1)
  })

  return component
}

export function RouterView() {
  const component = useRouterView()
  return () => component()
}

export function Lazy({ load }) {
  if (!isFunction(load)) {
    throw "Lazy component: parameter 'load' is not a legal function "
  }

  const [component, setComponent] = useState(null)
  load().then(
    res => {
      if (res.default) {
        return setComponent(_jsx(res.default))
      }

      const modules = Object.entries(res)
      for (let index = 0; index < modules.length; index++) {
        const [key, value] = modules[index]
        const _key = key[0]
        if (isFunction(value) && _key === _key.toUpperCase()) {
          return setComponent(_jsx(value))
        }
      }
    },
    err => error("component lazy", "loading has a error", err)
  )

  return () => component()
}

export function createBrowserRouter(options) {
  const router$ = new Observable()
  const { afterEnter, afterResolve, ...routeOptions } = options
  routeOptions.afterEnter = async (to, from) => {
    try {
      if (isFunction(afterEnter)) {
        await Promise.resolve(afterEnter(to, from))
      }

      router$.next({ to, from })

      if (isFunction(afterResolve)) {
        nextTick(() => afterResolve(to, from))
      }
    } catch (err) {
      error("afterEnter", "call afterEnter has a error", err)
    }
  }

  const appRouter = _createBrowserRouter(routeOptions)
  const { matchs } = appRouter.his.state.location

  return function RouterProvide() {
    const [_, setViews] = useProvide(INJECT_ROUTE_VIEW, matchs)
    useProvide(INJECT_ROUTE_ORDER, 0)

    router$.subscribe(({ to }) => {
      setViews(to.matchs)
    })

    useMount(() => {
      return () => {
        router$.complete()
        appRouter.his.destory()
      }
    })

    return () => _jsx("children", null)
  }
}
