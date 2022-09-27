import { useState } from "@setsuna/setsuna"

// 创建响应式状态的基本单元
export function ApiUseState() {
  // 创建状态
  const [num, setNum] = useState(0, [
    value => {
      console.log( "这是管道", value )
      return value
    }
  ])

  debugger

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
