// 是否有刷新操作等待处理
let isFlushPending = false

// 存储刷新之前需要执行的回调
const pendingPreFlushCbs: Function[] = []

//Promise对象 表示当前的刷新操作
let currentFlushPromise: Promise<void> | null = null

// 返回已解决的promise，调度异步操作在某些任务在当前执行上下文完成之后再执行
const resolvedPromise = Promise.resolve() as Promise<any>


/**
 * 封装queueCb，作为高阶函数传递参数
 * @param cb 回调函数
 */
export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}


/**
 * 回调函数cb添加到pendingQueue数组中
 * 调用queueFlush
 * @param cb
 * @param pendingQueue
 */
function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb)
  queueFlush()
}

/**
 * 确保刷新操作被调度
 */
function queueFlush(){
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

/**
 * 将isFlushPending置为false，表示刷新完成
 * 调用flushPreFlushCbs来执行所有待处理的刷新前回调
 */
function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

/**
 * 执行回调之前去重->执行所有回调->清空集合
 * 这样实现了将多次状态变化可以合并为一次更新
 */
export function flushPreFlushCbs() {
  if(pendingPreFlushCbs.length) {
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]  //去重
    pendingPreFlushCbs.length = 0

    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
