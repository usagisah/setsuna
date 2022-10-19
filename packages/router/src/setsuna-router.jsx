import { Home } from "../page/Home"
import { User } from "../page/User"
import {
  createBrowserRouter as _createBrowserRouter,
  useRouter
} from "./router"
import { Observable } from "@setsuna/observable"
import {
  useComputed,
  useContext,
  useEffect,
  useMount,
  useProvide,
  useState
} from "@setsuna/setsuna"
import { isFunction } from "@setsuna/share"

const INJECT_ROUTE_VIEW = "setsuna route view"
const INJECT_ROUTE_ORDER = "setsuna route order"

export { useRouter, useNavigate } from "./router"

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

export function useRouterView() {}

export function RouterView() {
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

  return () => component()
}

export function createBrowserRouter(options) {
  const router$ = new Observable()
  const { afterEach, ...routeOptions } = options
  routeOptions.afterEnter = (to, from) => {
    router$.next({ to, from })
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

    return () => <children />
  }
}

export const AppRouter = createBrowserRouter({
  base: "/",
  routes: [
    {
      path: "/",
      component: <Home />,
      loader: () => "A"
    },
    {
      path: "/user",
      component: <User />,
      loader: () => "B"
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})
