import { useState, useComputed, useRef, useChildren, useEffect, useUpdate, useMount } from "@setsuna/setsuna"
import { ApiUseComputed } from "./demo/api/useComputed"
import { ApiUseContext } from "./demo/api/useContext"
import { ApiUseEffect } from "./demo/api/useEffect"
import { ApiUseMount } from "./demo/api/useMount"
import { ApiUseRef } from "./demo/api/useRef"
import { ApiUseState } from "./demo/api/useState"
import { ApiUseUpdate } from "./demo/api/useUpdate"
import { Feature } from "./demo/feature/Feature"
import { Style } from "./demo/style/Style"
import { System } from "./modules/System"


// demo/api 是除了 useChildren 之外的 api
function Api() {
  return () => <>
    {/* <ApiUseState /> */}
    {/* <ApiUseComputed /> */}
    {/* <ApiUseEffect /> */}
    {/* <ApiUseRef /> */}
    {/* <ApiUseUpdate /> */}
    {/* <ApiUseMount /> */}
    {/* <ApiUseContext /> */}
  <System />
</>
}



export function App() {
  return () => <>
    {/* <Api /> */}
    {/* <Style_ /> */}
    {/* <Feature /> */}
    <System />
  </>
}
