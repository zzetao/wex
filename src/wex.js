/**
 * TODO:
 * ( ) module
 * ( ) setData diff
 * ( ) mapState / mapGetters
 */

exports.Store = class Store {
  constructor (storeOptions) {
    const { state, mutations, actions } = storeOptions
    this._state = state
    this._mutations = mutations
    this._actions = actions
    this._subscribers = []
  }

  get state() {
    return this._state
  }

  set state(v) {
    throw new Error('use store.replaceState() to explicit replace store state.')
  }

  dispatch (type, payload) {
    const action = this._actions[type]
    action(this, payload)
  }

  commit(type, payload) {
    const mutation = { type, payload }
    const entry = this._mutations[type]
    entry(this.state, payload)

    // 触发订阅
    this._subscribers.forEach(sub => sub(mutation, this.state))
  }

  subscribe(fn) {
    return genericSubscribe(fn, this._subscribers)
  }

}

exports.initial = function (store) {
  Log.info('initial')
  const originPageFn = Page

  Page = function (pageOptions) {
    const originOnLoad = pageOptions.onLoad
    const originOnUnload = pageOptions.onUnload
    const $data = pageOptions.$data

    pageOptions.onLoad = function () {
      this.$store = store
      // wex 数据订阅并更新
      this.$storeUnSubscribe = store.subscribe((mutation, state) => {
        Log.info('subscriber', mutation, state)
        const data = getDiffData($data, state)
        this.setData(data)
      })

      // 执行原有 onLoad 函数
      originOnLoad && originOnLoad.call(this)

      // 将页面需要从 wex 的数据赋值到 Page
      const data = getDiffData($data, store.state)
      this.setData(data)
    }

    pageOptions.onUnload = function () {
      originOnUnload && originOnUnload.call(this)

      // 取消订阅
      this.$storeUnSubscribe()
    }

    return originPageFn(pageOptions)
  }
}

const Log = {
  info() {
    console.log('[Wex]', ...arguments)
  }
}

function genericSubscribe(fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}

function getDiffData($data, state) {
  // TODO: 只处理值有更新的 key
  let data = {}
  $data.forEach(key => {
    data['$' + key] = state[key]
  })
  return data
}
