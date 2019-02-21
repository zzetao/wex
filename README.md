# Wex
> 微信小程序 vuex 状态管理

## 初始化

app.js

```js
const wex = require('wex')

const store = new wex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})

wex.initial(store)

// 小程序 App 入口
App({
  ...
})
```

页面逻辑
```js
Page({
  $data: [
    'count'
  ],
  data: {

  },
  onLoad () {
    setTimeout(() => {
      // 触发更新
      this.$store.dispatch('increment')
    }, 1000)
  }
})
```

Html 逻辑
```html
<!-- pages/index/index.wxml -->
<view>
  <text> count: {{ $count }} </text>
</view>
```
