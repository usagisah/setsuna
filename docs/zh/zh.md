<h1 align="center">Setsuna.js</h1>

一个响应式的、小巧的、渐进式、用于更好服务于 web 开发的`JavaScript`库





---





### 基本使用

```javascript
import { render } from "@setsuna/setsuna"
import { App } from "./App"

render(<App />, document.querySelector("#root"))
```



## hooks API 

+ <a href="#useState">useState</a>
+ <a href="#useComputed">useComputed</a>
+ <a href="">useRef</a>
+ <a href="">useEffect</a>
+ <a href="">useContext</a>
+ <a href="">useUpdate</a>
+ <a href="">useMount</a>



### `useState`

`useState`, 用于创建一个响应式的状态，声明时必须在组件的最顶层

参数有两个:
+ `initState: any` 状态的初始值
+ `pipes?: Array<Observable["pipe"]>` 可选的管道

返回值是一个数组，可以依次进行解构出
+ `state: () => any` 调用时会返回最新值的函数
+ `setState: ((newValue: any) => void) | any` 用于修改值的修改器，调用时会触发组件的更新

```javascript
import { useState } from "@setsuna/setsuna"

function App() {
  // 创建状态
  const [num, setNum] = useState(0, [
    value => {
      console.log( "这是管道", value )
      return value
    }
  ])

  // 传入具体的值修改状态
  const add1 = () => setNum(num() + 1)

  // 传入回调函数修改
  const add2 = () => setNum(n => n + 1)

  return () => <div>
    <p> {num()} </p>
    <button onClick={add1}>add1</button>
    <button onClick={add2}>add2</button>
  </div>
}
```

### `useComputed`

计算属性，即当一个`Observable | useState`类型的值发生修改时，会间接的触发自身的更新

可以视作是一个对于`useState`进行基本封装的工具`hook`

参数有两个:
+ `initState: any` 状态的初始值
+ `options?: Function | { get?: Function, set?: Function }` 可选的，获取器，或者修改器

返回值是一个数组:
+ `state: () => any` 调用时会返回最新值的函数
+ `setState: ((newValue: any) => void) | any` 用于修改值的修改器，调用时会触发组件的更新，如果没有定义修改器，则调用导致错误

```javascript
export function App () {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  // 只读，第二个参数是一个getter函数，同vue，此时使用修改函数会触发报错
  const [num1, setNum1] = useComputed([num], () => num() * 10)
  const add1 = () => setNum1(num1() + 1)

  // 可修改，第二个参数是一个对象，对象有 get/set 两个可选的选项，参数分别是函数
  const [num2, setNum2] = useComputed([num1], {
    get: () => num() * 10,
    set: newValue => setNum(newValue)
  })
  const add2 = () => setNum2(num2() + 1)
  
  return () => <h1>
    <p> state: {num()} </p>
    <p> <button onClick={add}>add state</button> </p>
    <hr />

    <p> computed1: {num1()} </p>
    <p> <button onClick={add1}>add state1</button> </p>
    <hr />

    <p> computed2: {num2()} </p>
    <p> <button onClick={add2}>add state2</button> </p>
    <hr />
  </h1>
}
```



### `useRef`

`useRef` 可以看做是一个不会触发更新`useState`，主要用于获取节点的真实 DOM 节点

```javascript
export function App() {
  const [ref] = useRef(null)
  setTimeout(() => {
    console.log( ref() )
  })
  
  return () => <h1 ref={ref}>useRef</h1>
}
```



### `useEffect`

`useEffect` 用于对状态进行监听

```javascript
export function App() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  // 回调函数表示成功时调用的回调函数
  useEffect([num], value => {
    console.log( value )
  })

  // 对象
  useEffect([num], {
    next: value => console.log( value ),
    complete: () => console.log( "end" )
  })

  return () => <div>
    <p> {num()} </p>
    <button onClick={add}>add1</button>
  </div>
}
```





###  `useContext`

用于创建具备 **深度** 更新效果的响应式状态

```javascript
const [useProvide, useContext] = createContext(0)

// 上下文
export function App() {
  const [num, setNum] = useProvide(1)
  const add = () => setNum(num() + 1)

  return () => <div>
    <p>root num: {num()}</p>
    <button class="px-4 py-2 bg-purple-600 text-white rounded-sm" onClick={add}>add</button>
    <hr />
    <Child1 />
  </div>
}

function Child1() {
  const num = useContext()
  return () => <div>
    <p> child1 num: {num()} </p>
    <hr />
    <Child2 />
  </div>
}

function Child2() {
  const num = useContext()
  return () => <div>
    <p> child2 num: {num()} </p>
  </div>
}
```



###  `useUpdate` 

更新相关的生命周期钩子函数

```javascript
export function App() {
  const [num1, setNum1] = useState(0)
  const add1= () => setNum1(n => n + 1)

  const [num2, setNum2] = useRef(0)
  const add2 = () => setNum2(n => n + 1)

  useUpdate(() => {
    // 更新前
    console.log( "beforeUpdate" )
    debugger
    return () => {
      // 更新后
      console.log( "updated" )
      debugger
    }
  }) 

  return () => <div>
    <p> {num1()} -- {num2()} </p>
    <button onClick={add1}>add1</button>
    <span> -- </span>
    <button onClick={add2}>add2</button>
  </div>
}
```



### `useMount`

挂载相关的生命周期钩子

```javascript
export function App() {
  useMount(() => {
    // 此时DOM还没有挂载
    console.log( "beforeMount" )
    debugger

    return () => {
      // 此时DOM已经挂载
      console.log( "mounted" )
      debugger
    }
  })

  return () => <div>
    ApiMount
  </div>
}
```





## 特性组件

+ <a href="">Await</a>
+ <a href="">Teleport</a>



### `Await`

`等待`组件，**该组件内部会进行浅层判断，识别已经是 Promise，或者返回 Promise 的函数，并等待其全部完成，期间会使用 fallback 参数指定的 UI**

```javascript
function Child({ num }) {
  return () => <div>我是 child 子组件 {num()} </div>
}
const LazyComponent = (num) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(<Child num={num} />)
    }, 3000)
  })
}

function Await() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  return () => <div>
    <Await fallback={<h1>loading</h1>}>
      {LazyComponent(num)}
    </Await>

    {/* active 默认是 false, 也就是说只有第一回会执行，后边只要不手动指定返回 true，这个组件将永远不会执行 */}
    {/* <Await fallback={<h1>loading</h1>} active={() => true}>
      {LazyComponent(num)}
    </Await> */}

    <p>{num()}</p>
    <button onClick={add}>add</button>
  </div>
}

```



### `Teleport`

传送门组件，使用时，会将内部结构传送到，参数`to`指定的`css选择器`的元素里面去

```javascript
function App() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)
  return () => (
    <div>
      <button onClick={add}>传送门 </button>

      {num() % 2 === 0 ? <Teleport to="body">我出来了 {num()}</Teleport> : null}
    </div>
  )
}
```

