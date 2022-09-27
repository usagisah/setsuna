import { setsunaPlugin } from "@setsuna/plugin-setsuna"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [setsunaPlugin()],
})

/* 
  import { guardVitePlugin, createRender } from "@setsuna/plugin-setsuna-guard"

  guardVitePlugin({
    type: "setsuna" | "vue" | "react"  setsuna默认内置，其他自动引入 guard-plugin-[vue | react] @xxx/guard-xxx

    createRoot 卡点创建开始
    component  需要全局引入的公共原件
    metaEnv:   需要自动注入的环境变量
    dev        在开发阶段前后干点什么
    build      在打包阶段前后干点什么
    module     有一套查找规则，这里可以定义和扩展规则，最后能取到模块信息
    server     对于请求的处理
    mock       mock 接口服务
    plugins    插件格式同第一项，内部通过属性区分是否是`核`插件，`核`是核心，其他都是普通的扩展
    mpa        多页面
    html       转换 html
  })
*/
