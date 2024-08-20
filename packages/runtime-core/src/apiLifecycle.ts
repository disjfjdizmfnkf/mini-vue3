import { LifecycleHooks } from './component'

/**
 * 注册 hook 到组件实例中
 * @param type hook 类型
 * @param hook
 * @param target 组件实例
 */
export function injectHook(
	type: LifecycleHooks,
	hook: Function,
	target: any
): Function | undefined {
	// 将 hook 注册到 组件实例中
	if (target) {
		target[type] = hook
		return hook
	}
}

/**
 * 创建一个指定的 hook
 * @param lifecycle 指定的 hook enum
 * @returns 注册 hook 的方法
 */
export const createHook = (lifecycle: LifecycleHooks) => {
	return (hook: Function, target: any) => injectHook(lifecycle, hook, target)
}

// 创建不同类型的register函数
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)