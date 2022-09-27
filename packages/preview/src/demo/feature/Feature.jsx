import { useState, Teleport, Await, defineElement } from "@setsuna/setsuna"


// 文档碎片，审查元素，不会渲染出真实DOM节点
function Fragment_() {
  return () => <>111</>
}

/* --------------  -------------- */

// 传送门，能传送到指定 `选择器` 上
function Teleport_() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)
  return () => (
    <div>
      <button onClick={add}>传送门 </button>

      {num() % 2 === 0 ? <Teleport to="body">我出来了 {num()}</Teleport> : null}
    </div>
  )
}

/* --------------  -------------- */

// 等待组件, 相当于简化版的 react 的 Suspense
// 逻辑是，只要内部`第一层`存在 Promise 就会用 fallback 来占位
// 内部有个参数 active，如果为 true 则会触发 Await 的更新

function Child({ num }) {
  return () => <div>我是 child 子组件 {num()} </div>
}
const LazyComponent = num => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(<Child num={num} />)
    }, 3000)
  })
}

function Await_() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  return () => (
    <div>
      <Await fallback={<h1>loading</h1>}>{LazyComponent(num)}</Await>

      {/* active 默认是 false, 也就是说只有第一回会执行，后边只要不手动指定返回 true，这个组件将永远不会执行 */}
      {/* <Await fallback={<h1>loading</h1>} active={() => true}>
      {LazyComponent(num)}
    </Await> */}

      <p>{num()}</p>
      <button onClick={add}>add</button>
    </div>
  )
}

/* --------------  -------------- */
function _TButton() {
  return () => (
    <button style={{ color: "red" }}>
      <slot />11
    </button>
  )
}
const TButton = defineElement("t-button", _TButton).wrapper()



/* --------------  -------------- */
export function Feature() {
  return () => (
    <div>
      {/* <Fragment_ /> */}
      {/* <Teleport_ /> */}
      {/* <Await_ /> */}

      {/* <t-button>custom element</t-button> */}
      {/* <TButton>custom element1</TButton> */}
      123
    </div>
  )
}