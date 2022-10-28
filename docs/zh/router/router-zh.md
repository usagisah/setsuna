<h1 align="center">@setsuna/router</h1>




## 介绍

`@setsuna/router`是官方提供的路由器

目前主要提供了如下的能力

+ 创建路由
+ 基于 `loader` 进行快速并发请求
+ 全局的前后守卫
+ 跳转后自定义滚动位置





## 下载

```bash
npm i @setsuna/router
```





## 导航

+ <a href="#基本使用">基本使用</a>

+ <a href="#创建路由器">创建路由器</a>

+ <a href="#RouterView">RouterView</a>

+ <a href="#Lazy">Lazy</a>

+ 全局钩子

  + <a href="#useRoute">useRoute</a>
  + <a href="#useNavigate">useNavigate</a>
  + <a href="#useRoute">useRoute</a>
  + <a href="基于 `loader` 进行快速并发请求">基于 `loader` 进行快速并发请求</a>
  
  





## 基本使用

```javascript
// router.js
import { createBrowserRouter, Lazy } from "@setsuna/router"
import { Home } from "./components/Home"
import { Error } from "./components/Error"

export const AppRouter = createBrowserRouter({
  routes: [
    {
      path: "/",
      component: <Home />
    },
    {
      path: ".*",
      component: <Lazy load={() => import("./components/Error")} />
    }
  ]
})
```

```javascript
//main.jsx
import { render } from "@setsuna/setsuna"
import { App } from "./App"
import { AppRouter } from "./router"

render(
  <AppRouter>
  	<App />
  </AppRouter>,
  document.querySelector("#root")
)
```

```javascript
//App.jsx
import { RouterView } from "@setsuna/router"

export function App() {
  return () => <RouterView />
}
```





## 创建路由

```javascript
import { createBrowserRouter, RouterView } from "@setsuna/router"
```

`createBrowserRouter `用于创建`history`路由器，即地址栏上没有 `#`

路由器会返回一个注入器`<AppRouter></AppRouter>`组件，只有使用该组件包裹您的应用组件才能正常显示匹配的组件，例如

```javascript
//main.jsx
import { render } from "@setsuna/setsuna"
import { App } from "./App"
import { AppRouter } from "./router"

render(
  //如果不进行包裹，内部无法正常显示
  <AppRouter>
  	<App />
  </AppRouter>,
  document.querySelector("#root")
)
```

两者路由器的属性有以下内容

```javascript
const AppRouter = createBrowserRouter({
  /*
  	字符串，可选，默认是 ""
  	该属性用于 规定 地址栏导航的前缀
  	例如跳转到 "/a"，base 是 "/prefix"，则最终的路由将会跳转到 "/prefix/a"
  	该前缀为默认行为，不需要在 routes/path 中显示指定
  */
  base,
  /* 
  	数组，必填
  	需要和地址栏进行匹配的条目 
  */
  routes: [
    {
      /*
      	匹配路径，例如 "/a"
      	动态路径，例如 "/a/:id"，取参数请使用 useRoute() 下的 params 属性
      	错误路由，例如 ".*"，该 path 在内部会被转换成正则表达式，.*将会匹配到所有
      */
      path,
      
     	/* 符合规定 path 要显示的组件 */
      component,
      
      /* 字符串，可选，路径为重定向的 path */
      redirect,
     afterResolve 
      /* 
      	函数，可选
      	该函数会在路径匹配的情况下，跳过组件层级，跳过守卫验证，在调用前置守卫之前并行的调用，避免出现常规路由的请求瀑布流的问题
      	获取数据请使在对应的组件层级中使用 useLoaderData() 来获取
      */
      loader,
      
      /* 子路由，内容与 routes 一致 */
      children
    }
  ],
  
  /*
  	全局的前置守卫
  	函数，可选
		该函数接收，即将跳转(此时地址栏尚未修改)的路由记录，以及当前的路由记录为参数 
		
		function afterEnter(to, from) {
			//返回值会被强转成 布尔值，true 则表示允许跳转
			return true
		}
		
		async function afterEnter(to, from) {
			//允许执行异步行为，后置的跳转会在返回值后发生
			
			await Delay(50000)
			return true
		}
		
		function afterEnter(to, from) {
			//如果返回的是一个字符串
			//在能匹配到的情况下，表示要进行重定向，匹配不到则没有任何效果
			return "/pageA"
		}
		
		function afterEnter(to, from) {
			//返回一个可以规定修改更多的行为
			
			return { 
				//重定向的地址
				path: "/pageB", 
				
				//混入一些参数
				query: { msg: "from pageA" },
				
				//是否强制触发跳转，默认为 false，即跳转路径和当前路径一样时，默认会取消跳转
				force: true
			}
		}
  */
  afterEnter,
  
  /*
  	全局的后置守卫（会在路由改变后，并且组件更新完毕后调用）
  	函数，可选
  	该函数接收，即将跳转(此时地址栏尚未修改)的路由记录，以及当前的路由记录为参数
  */
  afterResolve,
  
  /*
  	规定路由跳转后，自定义滚动的位置，返回值会传递给 window.scrollTo 作为参数
  	to, from 为当前路由，和上次路由的记录
  	savedPosition 为上次保存的位置信息
  	
  	function scrollBehavior(to, from, savedPosition) {
    	return { top: 0 }
  	}
  */
  scrollBehavior
})
```





## 基于 `loader` 进行快速并发请求

受到 `remix` 的启发，为了尽可能的避免瀑布流请求带来的影响

瀑布流即，跳转`/a/b`时

+ 首先挂载`/a`父组件页面
+ 发起属于父组件的请求
+ 挂载 `/b` 子组件页面
+ 发起属于子组件的请求
+ 后边以此类推

由于这种阶梯式的请求，往往会使越靠后的组件，渲染就会略微慢一些，因为发起请求的时间比较靠后

所以做出了这种`loader`的机制，每个层级的都可以声明一个`loader`加载函数，这些加载函数会**跳过组件层级，跳过守卫验证，在调用前置守卫之前并行的调用**

获取相关请求数据可以使用全局钩子`useLoaderData()` 进行获取，例如

```javascript
import {useLoaderData} from "@setsuna/router"
function App() {
  const data = useLoaderData()
  return () => <div>{ data }</div>
}
```

这种机制虽然达到更快的发出请求的目的，同时缺点也很明显

+ **假如深层次没有使用 `RouterView`组件来显示子组件，也会触发子组件相关的`loader`**





## RouterView

`<RouterView/>` 用于显示，与创建路由器中`routes`中`path` 相匹配的组件





## useRoute

获取当前路由的相关信息，比如当前路由的 `path, query, params`等





## Lazy

内置的用于懒加载组件的工具组件

`load`接收一个返回`Promise`的函数

该`Promise`会**优先使用默认导出，如果没有则会遍历所有导出的模块，取其中 是函数，并且首字母大写，当做是组件来使用**

```javascript
export const AppRouter = createBrowserRouter({
  routes: [
    {
      path: ".*",
      component: <Lazy load={() => import("./components/Error")} />
    }
  ]
})
```



## useNavigate

用于进行跳转的 Api

```javascript
import { RouterView, useNavigate } from "@setsuna/router"

export function App() {
  const {
    push,
    replace,
    go,
    back,
    forward
  } = useNavigate()
  
  return () => <RouterView />
}
```

+ `push( toPath || { path, query, force } )` 用于跳转，会添加一条路由记录
+ `replace( toPath || { path, query, force } )` 用于跳转，不会添加一条路由记录
+ `go( number )`  0表示当前页跳转，>0 表示前进到第 number 条路由记录， <0 表示回退几条
+ `back` 相当于 `go(-1)`
+ `forward` 相当于`go(0)`

