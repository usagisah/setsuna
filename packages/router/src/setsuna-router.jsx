import { Home } from "../page/Home"
import { User } from "../page/User"
import { createBrowserRouter as _createBrowserRouter } from "./router"
import { Observable } from "@setsuna/observable"
import { useContext, useProvide, useState } from "@setsuna/setsuna"
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

export function useRouterView() {}

export function RouterView() {
  const routerViewContext = useContext(INJECT_ROUTE_VIEW)
  const [component, setComponent] = useState(() => routerViewContext().value.options.component)
  console.log( routerViewContext().value )
  console.log(routerViewContext().next())
  // const [_, setProvide] = useProvide(
  //   INJECT_ROUTE_VIEW,
  //   routerViewContext.nextRoute()
  // )

  // useEffect([routerViewContext], route => {
  //   if (!route) {
  //     return
  //   }

  //   setComponent(route.options.component)
  //   // setProvide(route.nextRoute())
  // })

  return () => component()
}

export function createBrowserRouter(options) {
  const router$ = new Observable()
  const { afterEach, ...routeOptions } = options
  routeOptions.afterEach = (to, from) => {
    router$.next({ to, from })
  }

  const appRouter = _createBrowserRouter(routeOptions)

  return function RouterProvide() {
    const [_, setProvide] = useProvide(
      INJECT_ROUTE_VIEW,
      appRouter.getCurrentRoute()
    )

    router$.subscribe(({ to }) => {
      setProvide(to)
    })

    return () => <children />
  }
}

// export { useRoute, useRouter } from "./router"

export const AppRouter = createBrowserRouter({
  base: "/user",
  routes: [
    {
      path: "/",
      component: <Home />
    },
    {
      path: "/user",
      component: <User />,
      children: [
        {
          path: "/u",
          component: <Login />
        }
      ]
    }
  ]
})
