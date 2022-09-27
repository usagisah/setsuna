import { createContext } from "@setsuna/setsuna"

const [useProvide, useContext] = createContext(0)

// 上下文
// 相当于 react 的 createContext，自身的值的改变会强制所有子树的刷新
export function ApiUseContext() {
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