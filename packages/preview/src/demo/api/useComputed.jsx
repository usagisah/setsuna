import { useComputed, useState } from "@setsuna/setsuna"

// 计算属性
// 接收一个要监听的数组，
// 第二个参数为选项

// 主要用于派生状态，即依赖的值变化自身也要有些变化状态，所以没有管道
export function ApiUseComputed () {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  // 只读，第二个参数是一个getter函数，同vue，此时使用修改函数会触发报错
  const [num1, setNum1] = useComputed([num], () => num() * 10)
  const add1 = () => setNum1(num1() + 1)

  // 可修改，第二个参数是一个对象，对象有 get/set 两个可选的选项，参数分别是函数
  // 行为同 vue
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