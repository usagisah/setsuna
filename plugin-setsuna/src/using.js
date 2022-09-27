// 有效
function test1() {
  transformPlugin(`
  export function App_0() { return () => null }
  export function App_1() { return () => <></> }
  export function App_2() { return () => <h1></h1> }
  export function App_3() { return function() { return null } }
  export function App_4() { return function() { return <></> } }
  export function App_5() { return function() { return <h1></h1> } }
  export function App_6() { return function anyName() { return null } }
  export function App_7() { return function anyName() { return <></> } }
  export function App_8() { return function anyName() { return <h1></h1> } }
  export default function () { return () => <></> }
  
  function App_9() { return function anyName() { return <h1></h1> } }
  export { App_9 }
  
  export const App_11 = () => { return () => <div></div> }
  export const App_12 = () => { return () => <></> }
  export const App_13 = () => { return () => null }
  export const App_14 = () => () => <div></div>
  export const App_15 = () => () => <></>
  export const App_16 = () => () => null
  export const App_17 = () => function(){ return <></> }
  export const App_18 = () => function(){ return <div></div> }
  export const App_19 = () => function(){ return null }
  
  const App_20 = () => () => null
  const App_21 = () => function() { return null }
  export { App_21 }
`)
}

// 无效
function test2() {
  transformPlugin(`  
  //无效
  function App1() {}
  function App2() {}
  function App3() { return function(){} }
  function App4() { return () => {} }
  function App5() { return null }
  
  const App6 = () => {}
  const App7 = function() {}
  const App8 = () => null
  const App9 = function() { return null }
  
  export function App10() {}
  export function App11() {}
  export function App12() { return function(){} }
  export function App13() { return () => {} }
  export function App14() { return null }
  export const App15 = () => {}
  export const App16 = function() {}
  export const App17 = () => null
  export const App18 = function() { return null }
  
  export function App19() { return () => {} }
  export function App20() { return function() {} }
  export function App21() { return () => 1 }
  export function App22() { return function() { return false } }
  
  export const App23 = 1
  export const App24 = null
  
  const App25 = false
  export { App25 }`)
}
