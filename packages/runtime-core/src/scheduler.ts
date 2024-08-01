// 是否有刷新操作等待处理
let isFlushPending = false

// 存储刷新之前需要执行的回调
const pendingPreFlushCbs: Function[] = []

//Promise对象 表示当前的刷新操作
let currentFlushPromise: Promise<void> | null = null

// 已解决的promise，用于调度刷新
const resolvedPromise = Promise.resolve() as Promise<any>


/**
 * 高阶函数，封装queueCb，传递参数
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
 * 执行所有回调，清空结合
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
