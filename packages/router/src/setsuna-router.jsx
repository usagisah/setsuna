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
  useProvide,
  useState
} from "@setsuna/setsuna"
import { Login } from "../page/Login"

// const router = createBrowserRouter({
//   base: "/",
//   routes: [
//     {
//       path: "/",
//       redirect: "",
//       loader: async () => null,
//       children: []
//     }
//   ],
//   beforeEach: [(to, from) => {}],
//   afterEach: [(to, from) => {}],
//   scrollBehavior: (to, from) => {}
// })

// useRouter()
// useRoute()
// useRouterView()

/* 
  + 注册一个 router 的回调函数，每当改变时就修改向下注入的路由内容
  + 每次 <RouterView/> 时，用 nextRoute() 取到子路由，如果不同则改变当前使用的组件
*/

const INJECT_ROUTE_VIEW = Symbol("setsuna route view")
const INJECT_ROUTE_ORDER = Symbol("setsuna route order")

export function useRouterView() {}

export { useRouter, useNavigate } from "./router"

export function useRoute() {
  const order = useContext(INJECT_ROUTE_ORDER)
  return useComputed([order], () => useRouter().his.state.location.state)
}

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

  const { matchs } = _createBrowserRouter(routeOptions).his.state.location
  return function RouterProvide() {
    const [views, setViews] = useProvide(INJECT_ROUTE_VIEW, matchs)
    const [order, setOrder] = useProvide(INJECT_ROUTE_ORDER, 0)
    router$.subscribe(({ to }) => setViews(to.matchs))
    return () => <children />
  }
}

export const AppRouter = createBrowserRouter({
  routes: [
    {
      path: "/",
      component: <Home />
    },
    {
      path: "/user",
      component: <User />
    }
  ]
})
