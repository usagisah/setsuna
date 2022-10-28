<h1 align="center">@setsuna/observable</h1>



## 下载

```bash
npm i @setsuna/observable
```



## 使用

```javascript
import { Observable } from "@setsuna/observable"

// 创建一个流
const subject = new Observable()


// 使用管道
subject.pipe(
	value => value,
  {
    next: v => v,
    error: e => { throw e },
    complete: () => null
  }
)

//订阅流方式1, 直接一个函数相当于只接收成功的回调函数
subject.subscribe(v => console.log(v)) 


//订阅流方式2，接收一个对象
subject.subscribe({
  //成功时调用
  next: newValue => console.log(newValue),
  //失败时调用
  error: err => console.error(err),
  //关闭流时调用
  complete: () => null
})


//订阅流方式3，在创建时调用
const subject1 = new Observable(subject)


//发送一个正常的值
subject.next(1)
//发送一个错误的值
subject.error(3)
//结束一个流
subject.complete()
```



## 介绍

`@setsuna/router`是官方提供的`setsuna.js`响应式规范的基本实现，只要符合我们的规范您可以自定义创建您自己的`Observable`响应式函数

如果您有接触过`rxjs`，会发现大体上的写法几乎一样，行为上有些像是`rxjs + promise`的结合体，比如错误透传是用的`throw error`，这是有意为之，也是故意做成了这个样子

事实上在构思的初期，是准备直接打算用`rxjs`来作为响应式 API 的实现方案的，`rxjs`这种组合机制，不管是对于日常写库，还是作为业务开发来说，都是很好的代码组合手段

因为对于前端来说，我们不管如何使用 js，基本都是由一个事件开始，不同事件组合成了要达到最终目的的事件链，而事件链呢，就是一个求值的过程，而求值的目的是什么？是将最新的值同步到我们的页面上。于是我们可以将起始事件当做是发生源（起个名字叫 `Observable`），而求值的过程我们为了方便管理和维护，会进行拆分，也就是事件链，我们将这个对于初始事件的值，在这个事件链中经过的过程视作管道（`pipe`），而将最终的值同步到视图，也就是消费值的地方叫做订阅（`subscribe`）

但是一个事件往往不会支出产生上述这样一个过程，于是过程和过程之间需要能够进行组合，例如一个事件源（`Observable`）可以触发多个事件链，于是`Observable`之间需要可以进行互相订阅，于是就形成了以下的链条

1. 创建一个用于监听某些事件，或者是手动触发的发布者（Observable）
2. 将初始值不断加工能成最终形式的值的过程，管道函数（pipe( fn1, fn2, fn3.... )）
3. 消费值的地方，订阅者 （`subscribe`）

`Observable -> pipe -> subscribe`

`rxjs`就提供了这样一套现成且又成熟的抽象机制，但是在实际使用中发现了这样的情况，官方提供的管道和创建函数，正常情况下我们可能只能用到些最最基础的能力，对于异步管理依赖较强的应用使用率可能都不会超过**50% - 60%**，加上我们希望即便在不依赖 `treehaking`的情况下包体积也能尽可能的小，还有对于一个框架来说，`rxjs`这种内部调度的复杂性也多少有点复杂

所以我们相当于沿用了`rxjs`的思想，然后尽可能的简化它的复杂度，以及使用成本，编写相关工具函数以及二次封装的上手成本，于是就有了现在这套

功能依靠 **规范** 来约束最新限度的行为，只要满足约定即可自定义使用，或者多次封装使用

复杂度则是依靠`Promise`来进行简化，即对于异步操作都是基于`Promise`



## 规范约定

+ 任意观察者，发射源，都必须继承或者使用`Observable`这个基类

+ 满足以下要求的，都可以作为基类`Observable`

  + 当 `Observable`的初始参数也是符合`Observable`要求的基类的话，应该隐式订阅

  + 有一个 `pipe`方法用于挂载管道

  + 有一个`subscribe`方法用于订阅，消费上层发射的值

  + 有一个`next`方法用于发射`success`成功状态的值

  + 有一个`error`方法用于发射`error`异常状态的值

  + 有一个`complete`方法用于关于发射源，当关闭后，不可再次打开，不能触发任意的管道和订阅方法

  + 管道（`pipe`） 和 订阅者（`subscribe`）的注册形式分别有两种

    + `(newValue: any) => any`，直接使用函数，相当于只注册了`success`状态下的回调函数

    + `{ next: (newValue: any) => any, error: (error: any) => any | thorw error, complete: () => any }` 

      使用对象形式，`next`表示消费`success`的值，`error`是消费`error`异常状态的值，`complete`表示当流关闭时的回调函数

    + 管道中，对象形式 `error`的回调函数行为同 `Promise`，如果正常返回则值会传递给后边的`success`的回调函数，如果要透传，需要继续抛出错误，后边的会进行捕获达到透传的效果

    + 管道中的函数如果返回 `skip flag`将会停止往后的过程，如果返回`loop flag`则会终端当前的过程，从头再来，flag 可以自己拟定

  + `subscribe`返回使用后，需要返回一个取消订阅的函数

  + `subscribe, pipe, next, error, complete`函数都是同步执行
