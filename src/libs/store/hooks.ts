import type {
    Action,
    AsyncAction,
    BaseState,
    Getter,
    HybridState,
    Selector,
    StoreType,
    SubscribeCallback,
    SubscribeOptions,
} from './types';

import { useSyncExternalStore } from 'react';
import { shallow } from 'zustand/shallow';

/**
 * 深度相等比较
 */
const deepEquals = <T>(a: T, b: T): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (
            !Object.prototype.hasOwnProperty.call(b as Record<string, unknown>, key) ||
            !deepEquals(
                (a as Record<string, unknown>)[key],
                (b as Record<string, unknown>)[key]
            )
        ) {
            return false;
        }
    }

    return true;
};

/**
 * 创建基础 useStore Hook
 * @param store Store 实例
 */
export const createUseStore = <T extends BaseState>(store: StoreType<T>) => {
    /**
     * 获取完整状态
     */
    const useStore = (): T => {
        return useSyncExternalStore(
            store.subscribe,
            store.getState,
            store.getState
        );
    };

    /**
     * 使用选择器获取状态
     * @param selector 选择器函数
     */
    const useSelector = <R = T>(selector: Selector<T, R>): R => {
        return useSyncExternalStore(
            store.subscribe,
            () => selector(store.getState()),
            () => selector(store.getState())
        );
    };

    /**
     * 使用多个选择器获取状态
     * @param selectors 选择器数组
     */
    const useSelectors = <R extends unknown[]>(selectors: {
        [K in keyof R]: Selector<T, R[K]>;
    }): R => {
        return useSyncExternalStore(
            store.subscribe,
            () => selectors.map((s) => s(store.getState())) as R,
            () => selectors.map((s) => s(store.getState())) as R
        );
    };

    /**
     * 使用浅比较选择器
     * @param selector 选择器函数
     */
    const useShallowSelector = <R extends unknown[]>(selector: Selector<T, R>): R => {
        return useSyncExternalStore(
            store.subscribe,
            () => selector(store.getState()),
            () => selector(store.getState()),
            (a, b) => shallow(a as Record<string, unknown>, b as Record<string, unknown>)
        );
    };

    /**
     * 获取 Store 实例（非响应式）
     */
    const getStore = () => store;

    return {
        useStore,
        useSelector,
        useSelectors,
        useShallowSelector,
        getStore,
    };
};

/**
 * 创建带 Actions 的 Hook
 * @param store Store 实例
 * @param actionsSelector Actions 选择器
 */
export const createActionsHook = <
    T extends BaseState,
    A extends Record<string, Action<T> | AsyncAction<T>>
>(
    store: StoreType<T & A>,
    actionsSelector?: (state: T & A) => A
) => {
    const selectActions = (state: T & A): A => {
        return actionsSelector ? actionsSelector(state) : (({ ...state } as unknown) as A);
    };

    return () => {
        const actions = useSyncExternalStore(
            store.subscribe,
            () => selectActions(store.getState()),
            () => selectActions(store.getState())
        );
        return actions;
    };
};

/**
 * 创建状态和 Actions 的组合 Hook
 * @param store Store 实例
 * @param actionsSelector Actions 选择器
 */
export const createStoreActionsHook = <
    T extends BaseState,
    A extends Record<string, Action<T> | AsyncAction<T>>
>(
    store: StoreType<T & A>,
    actionsSelector?: (state: T & A) => A
) => {
    const selectActions = (state: T & A): A => {
        return actionsSelector ? actionsSelector(state) : (({ ...state } as unknown) as A);
    };

    return (): [T, A] => {
        const state = useSyncExternalStore(store.subscribe, store.getState, store.getState());
        const actions = useSyncExternalStore(
            store.subscribe,
            () => selectActions(store.getState()),
            () => selectActions(store.getState())
        );

        return [state as T, actions];
    };
};

/**
 * 创建 Hybrid Store Hook
 * @param store Hybrid Store 实例
 */
export const createHybridHook = <T extends BaseState>(store: StoreType<HybridState<T>>) => {
    /**
     * 获取完整状态
     */
    const useHybridState = (): HybridState<T> => {
        return useSyncExternalStore(store.subscribe, store.getState, store.getState);
    };

    /**
     * 获取数据
     */
    const useData = (): T => {
        return useSyncExternalStore(
            store.subscribe,
            () => store.getState().data,
            () => store.getState().data
        );
    };

    /**
     * 获取加载状态
     */
    const useLoading = (): boolean => {
        return useSyncExternalStore(
            store.subscribe,
            () => store.getState()._isLoading ?? false,
            () => store.getState()._isLoading ?? false
        );
    };

    /**
     * 获取错误信息
     */
    const useError = (): Error | string | null => {
        return useSyncExternalStore(
            store.subscribe,
            () => store.getState()._error ?? null,
            () => store.getState()._error ?? null
        );
    };

    /**
     * 获取最后更新时间
     */
    const useLastUpdate = (): number | undefined => {
        return useSyncExternalStore(
            store.subscribe,
            () => store.getState()._lastUpdate,
            () => store.getState()._lastUpdate
        );
    };

    return {
        useHybridState,
        useData,
        useLoading,
        useError,
        useLastUpdate,
    };
};

/**
 * 订阅状态变化 Hook
 * @param store Store 实例
 * @param callback 回调函数
 * @param options 订阅选项
 */
export const useStoreSubscription = <T extends BaseState>(
    store: StoreType<T>,
    callback: SubscribeCallback<T>,
    options: SubscribeOptions = {}
) => {
    const { fireImmediately = false } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getSnapshot = () => store.getState() as any;

    const subscribe = (callback: () => void) => {
        const unsubscribe = store.subscribe((state, previousState) => {
            callback();
        });
        return unsubscribe;
    };

    useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    // 立即执行
    if (fireImmediately) {
        const current = store.getState();
        callback(current, current);
    }
};

/**
 * 创建派生状态 Hook (Getter)
 * @param store Store 实例
 * @param getter 计算函数
 * @param deps 依赖数组
 */
export const createDerivedState = <T extends BaseState, R>(
    store: StoreType<T>,
    getter: Getter<T, R>,
    deps: unknown[] = []
): (() => R) => {
    return () => {
        const state = useSyncExternalStore(store.subscribe, store.getState, store.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
        return getter(state);
    };
};

/**
 * 使用 Getter 创建计算属性 Hook
 * @param store Store 实例
 */
export const createGetterHook = <T extends BaseState>(store: StoreType<T>) => {
    /**
     * 创建计算属性
     * @param getter 计算函数
     * @param customEquals 自定义比较函数
     */
    return <R>(
        getter: Getter<T, R>,
        customEquals?: (prev: R, curr: R) => boolean
    ): R => {
        const prevRef = { current: null as R | null };

        return useSyncExternalStore(
            store.subscribe,
            () => {
                const current = getter(store.getState());
                if (prevRef.current === null) {
                    prevRef.current = current;
                    return current;
                }
                const equalsFn = customEquals ?? deepEquals;
                if (equalsFn(prevRef.current, current)) {
                    return prevRef.current;
                }
                prevRef.current = current;
                return current;
            },
            () => getter(store.getState())
        );
    };
};

/**
 * 创建使用选择器数组的 Hook
 * @param store Store 实例
 */
export const createSelectorsHook = <T extends BaseState>(store: StoreType<T>) => {
    /**
     * 使用多个选择器
     * @param selectors 选择器数组
     */
    return <R extends unknown[]>(selectors: {
        [K in keyof R]: Selector<T, R[K]>;
    }): R => {
        return useSyncExternalStore(
            store.subscribe,
            () => selectors.map((s) => s(store.getState())) as R,
            () => selectors.map((s) => s(store.getState())) as R
        );
    };
};

/**
 * 跟踪特定字段变化 Hook
 * @param store Store 实例
 * @param key 字段名
 */
export const useStoreField = <T extends BaseState, K extends keyof T>(
    store: StoreType<T>,
    key: K
): T[K] => {
    return useSyncExternalStore(
        store.subscribe,
        () => store.getState()[key],
        () => store.getState()[key]
    );
};

/**
 * 跟踪多个字段变化 Hook
 * @param store Store 实例
 * @param keys 字段名数组
 */
export const useStoreFields = <T extends BaseState, K extends keyof T>(
    store: StoreType<T>,
    keys: K[]
): Pick<T, K> => {
    return useSyncExternalStore(
        store.subscribe,
        () => {
            const state = store.getState();
            const result = {} as Pick<T, K>;
            for (const key of keys) {
                result[key] = state[key];
            }
            return result;
        },
        () => {
            const state = store.getState();
            const result = {} as Pick<T, K>;
            for (const key of keys) {
                result[key] = state[key];
            }
            return result;
        }
    );
};

/**
 * 使用历史状态 Hook
 * @param store Store 实例
 * @param maxSize 最大历史记录数
 */
export const useHistoryState = <T extends BaseState>(store: StoreType<T>, maxSize = 10) => {
    const historyRef = {
        past: [] as T[],
        present: store.getState(),
        future: [] as T[],
    };

    const subscribe = (callback: () => void) => {
        return store.subscribe((state, previousState) => {
            if (state !== previousState) {
                historyRef.past = [...historyRef.past, previousState].slice(-maxSize);
                historyRef.present = state;
                historyRef.future = [];
            }
            callback();
        });
    };

    useSyncExternalStore(subscribe, () => historyRef.present, () => historyRef.present);

    const undo = (): boolean => {
        const previous = historyRef.past.pop();
        if (previous) {
            historyRef.future.push(historyRef.present);
            store.setState(previous);
            return true;
        }
        return false;
    };

    const redo = (): boolean => {
        const next = historyRef.future.pop();
        if (next) {
            historyRef.past.push(historyRef.present);
            store.setState(next);
            return true;
        }
        return false;
    };

    const canUndo = () => historyRef.past.length > 0;
    const canRedo = () => historyRef.future.length > 0;

    return {
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
