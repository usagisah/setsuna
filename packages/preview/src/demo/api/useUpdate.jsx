import { useRef, useState, useUpdate } from "@setsuna/setsuna"

// 相当于 vue 的 onBeforeUpdate updated 生命周期
export function ApiUseUpdate() {
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