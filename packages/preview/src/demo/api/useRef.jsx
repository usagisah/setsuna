import { useRef } from "@setsuna/setsuna"

// 用于获取 DOM 元素
// 和 useState 内部行为唯一的区别在于，自身更新不会触发深层次更新
export function ApiUseRef() {
  const [ref] = useRef(null)
  setTimeout(() => {
    console.log( ref() )
  })
  
  return () => <h1 ref={ref}>useRef</h1>
}