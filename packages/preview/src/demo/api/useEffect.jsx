import { useEffect, useState } from "@setsuna/setsuna"


// 对标的是 vue 的 watch
// 参数1 是要监听的数组
// 参数2 是Observable的回调参数

// 和 useComputed 定位大致相同，用于监听某些数据变化后的回调，对于一个事件要同时干若干件没什么联系的事件时，会很有用
export function ApiUseEffect() {
  const [num, setNum] = useState(0)
  const add = () => setNum(num() + 1)

  // 回调函数表示成功时调用的回调函数
  useEffect([num], value => {
    console.log( value )
  })

  // 对象时，可以除了三种状态
  useEffect([num], {
    next: value => console.log( value ),
    complete: () => console.log( "end" )
  })

  return () => <div>
    <p> {num()} </p>
    <button onClick={add}>add1</button>
  </div>
}