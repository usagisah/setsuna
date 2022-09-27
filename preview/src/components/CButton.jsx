import { defineElement } from "@setsuna/setsuna"

function Button() {
  return () => <button>自定义 button</button>
}

export const CButton = defineElement("c-button", Button).wrapper()

import.meta.hot.accept(() => {
  return 
})