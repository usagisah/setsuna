import css from "./style.module.scss"

export function Style() {
  return () => (
    <div class="p-4 flex gap-4">
      <button class={css.button}>这是基于 css module 的样式</button>
      <button class="px-4 py-2 bg-purple-600 text-white rounded-md active:bg-purple-700">
        这是基于 tailwindcss 原子CSS方案的 CSS
      </button>

      <button style="color: red">内联 字符串 样式</button>
      <button style={{ color: "red" }}>内联 对象 样式</button>

      <button class={{ a: true, b: false }}>内联 对象 class</button>
      <button class={["a", Math.random() > 0.5 && "b"]}>内联 数组 class</button>
    </div>
  )
}
