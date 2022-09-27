import { useMount } from "@setsuna/setsuna"

// 生命周期
export function ApiUseMount() {
  useMount(() => {
    // 挂载前，相当于 vue 的 beforeMount
    // 此时DOM还没有挂载
    console.log( "beforeMount" )
    debugger

    return () => {
      // 挂载后，相当于 vue 的 mounted
      // 此时DOM已经挂载
      console.log( "mounted" )
      debugger
    }
  })

  return () => <div>
    ApiMount
  </div>
}