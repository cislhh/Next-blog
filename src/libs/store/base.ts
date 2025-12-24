import type {
    Action,
    AsyncAction,
    BaseState,
    DeepMergeOptions,
    Getter,
    HybridState,
    MergeStrategy,
    PartialState,
    StoreConfig,
    StoreMetadata,
    StoreType,
    SubscribeCallback,
    SubscribeOptions,
} from './types';

import type { StateCreator } from 'zustand';

import { createStore as createBaseStore } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import deepmerge from 'deepmerge';

/**
 * 深度合并状态
 */
const deepMergeState = <T extends BaseState>(
    current: T,
    partial: PartialState<T>,
    options: DeepMergeOptions = {}
): T => {
    const { arrayMerge = 'merge-by-index', clone = true } = options;

    if (typeof partial === 'function') {
        return { ...current };
    }

    const mergeOptions: deepmerge.Options = {
        clone,
        arrayMerge: (destinationArray, sourceArray) => {
            if (arrayMerge === 'concat') {
                return [...destinationArray, ...sourceArray];
            }
            if (arrayMerge === 'replace') {
                return sourceArray;
            }
            return sourceArray;
        },
    };

    return deepmerge(current, partial as Partial<T>, mergeOptions);
};

/**
 * 创建普通 Store
 * @param initialState 初始状态
 * @param config Store 配置
 */
export const createStore = <T extends BaseState>(
    initialState: T,
    config?: Partial<Omit<StoreConfig<T>, 'persist' | 'persistOptions'>>
): StoreType<T> => {
    const name = config?.name ?? 'anonymous-store';

    const store = createBaseStore<T>()(
        devtools(
            () => initialState,
            {
                name,
                enabled: config?.devtools ?? process.env.NODE_ENV === 'development',
                ...config?.devtoolsOptions,
            }
        )
    );

    // 添加元数据
    const metadata: StoreMetadata = {
        createdAt: Date.now(),
        version: '1.0.0',
        lastUpdate: Date.now(),
    };

    (store as unknown as { metadata: StoreMetadata }).metadata = metadata;

    return store;
};

/**
 * 创建带 Immer 的 Store
 * @param initialState 初始状态
 * @param config Store 配置
 */
export const createImmerStore = <T extends BaseState>(
    initialState: T,
    config?: Partial<Omit<StoreConfig<T>, 'persist' | 'persistOptions'>>
): StoreType<T> => {
    const name = config?.name ?? 'immer-store';

    return createBaseStore<T>()(
        subscribeWithSelector(
            immer(
                devtools(
                    () => initialState,
                    {
                        name,
                        enabled: config?.devtools ?? process.env.NODE_ENV === 'development',
                        ...config?.devtoolsOptions,
                    }
                )
            )
        )
    );
};

/**
 * 创建持久化 Store
 * @param initialState 初始状态
 * @param config Store 配置
 */
export const createPersistStore = <T extends BaseState>(
    initialState: T,
    config: StoreConfig<T>
): StoreType<T> => {
    const { name, persistOptions, devtoolsOptions } = config;

    const persistConfig = {
        name: `zustand-${name}`,
        version: 1,
        ...persistOptions,
    };

    return createBaseStore<T>()(
        subscribeWithSelector(
            immer(
                devtools(
                    persist(() => initialState, persistConfig),
                    {
                        name,
                        enabled: config.devtools ?? process.env.NODE_ENV === 'development',
                        ...devtoolsOptions,
                    }
                )
            )
        )
    );
};

/**
 * Store 工具类 - 提供链式操作
 */
export class StoreHelper<T extends BaseState> {
    constructor(private store: StoreType<T>) {}

    /**
     * 获取当前状态
     */
    getState(): T {
        return this.store.getState();
    }

    /**
     * 设置状态（浅合并）
     */
    setState(partial: PartialState<T>): void {
        this.store.setState(partial);
    }

    /**
     * 强制替换整个状态
     */
    replaceState(state: T): void {
        this.store.setState(state, true);
    }

    /**
     * 合并状态（支持深度合并）
     */
    mergeState(partial: PartialState<T>, strategy: MergeStrategy = 'shallow'): void {
        const current = this.getState();

        if (strategy === 'shallow') {
            this.setState(partial as Partial<T>);
        } else if (strategy === 'deep') {
            const merged = deepMergeState(current, partial);
            this.setState(merged);
        } else if (strategy === 'replace') {
            if (typeof partial === 'function') {
                const draft = { ...current };
                (partial as (state: T) => void)(draft);
                this.setState(draft);
            } else {
                this.replaceState(partial as T);
            }
        }
    }

    /**
     * 重置状态到初始值
     */
    resetState(initialState: T): void {
        this.replaceState(initialState);
    }

    /**
     * 订阅状态变化
     */
    subscribe(
        callback: SubscribeCallback<T>,
        options: SubscribeOptions = {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): () => void {
        const { fireImmediately = false } = options;

        if (fireImmediately) {
            callback(this.getState(), this.getState());
        }

        return this.store.subscribe(callback);
    }

    /**
     * 订阅特定字段的变化
     */
    subscribeTo<K extends keyof T>(
        key: K,
        callback: (value: T[K], previousValue: T[K]) => void,
        options: SubscribeOptions = {}
    ): () => void {
        const { fireImmediately = false } = options;

        const wrappedCallback: SubscribeCallback<T> = (state, previousState) => {
            if (state[key] !== previousState[key]) {
                callback(state[key], previousState[key]);
            }
        };

        if (fireImmediately) {
            const current = this.getState();
            callback(current[key], current[key]);
        }

        return this.store.subscribe(wrappedCallback);
    }

    /**
     * 创建派生状态（计算属性）
     */
    createGetter<R>(getter: Getter<T, R>): () => R {
        return () => getter(this.getState());
    }

    /**
     * 添加 action 到 Store
     */
    addAction<N extends string, A extends Action<T> | AsyncAction<T>>(name: N, action: A): void {
        (this.store as unknown as Record<string, unknown>)[name] = action;
    }

    /**
     * 批量更新状态
     */
    batchUpdate(updater: (state: T) => void): void {
        const state = this.getState();
        const newState = { ...state };
        updater(newState);
        this.setState(newState);
    }

    /**
     * 获取 Store 实例
     */
    getStore(): StoreType<T> {
        return this.store;
    }
}

/**
 * 创建 Store Helper
 */
export const createStoreHelper = <T extends BaseState>(store: StoreType<T>): StoreHelper<T> => {
    return new StoreHelper(store);
};

/**
 * 创建带 Actions 的 Store
 */
export const createStoreWithActions = <
    T extends BaseState,
    A extends Record<string, Action<T, unknown[], unknown> | AsyncAction<T, unknown[], unknown>>
>(
    initialState: T,
    actions: A,
    config?: Partial<Omit<StoreConfig<T>, 'persist' | 'persistOptions'>>
): StoreType<T & A> => {
    const name = config?.name ?? 'store-with-actions';

    const stateCreator: StateCreator<T & A> = (set, get) => ({
        ...initialState,
        ...actions,
    });

    return createBaseStore<T & A>()(
        subscribeWithSelector(
            immer(
                devtools(stateCreator, {
                    name,
                    enabled: config?.devtools ?? process.env.NODE_ENV === 'development',
                    ...config?.devtoolsOptions,
                })
            )
        )
    );
};

/**
 * 创建混合状态 Store（支持异步操作）
 */
export const createHybridStore = <T extends BaseState>(
    initialState: T,
    config?: Partial<Omit<StoreConfig<T>, 'persist' | 'persistOptions'>>
): StoreType<HybridState<T>> => {
    const name = config?.name ?? 'hybrid-store';

    const hybridInitialState: HybridState<T> = {
        data: initialState,
        _isLoading: false,
        _error: null,
        _lastUpdate: Date.now(),
    };

    return createBaseStore<HybridState<T>>()(
        subscribeWithSelector(
            immer(
                devtools(() => hybridInitialState, {
                    name,
                    enabled: config?.devtools ?? process.env.NODE_ENV === 'development',
                    ...config?.devtoolsOptions,
                })
            )
        )
    );
};

/**
 * 异步操作包装器
 */
export const wrapAsyncOperation = async <T extends BaseState, R>(
    store: StoreType<HybridState<T>>,
    operation: () => Promise<R>,
    options = { setLoading: true, setError: true }
): Promise<R> => {
    if (options.setLoading) {
        store.setState({ _isLoading: true, _error: null });
    }

    try {
        const result = await operation();
        store.setState({
            _isLoading: false,
            _error: null,
            _lastUpdate: Date.now(),
        });
        return result;
    } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        if (options.setError) {
            store.setState({
                _isLoading: false,
                _error: errorObj,
                _lastUpdate: Date.now(),
            });
        }
        throw errorObj;
    }
};
