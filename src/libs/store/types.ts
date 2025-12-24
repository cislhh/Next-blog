import type { Draft } from 'immer';
import type { StoreApi } from 'zustand';
import type { DevtoolsOptions, PersistOptions, StorageValue } from 'zustand/middleware';

/**
 * 基础状态类型
 */
export type BaseState = Record<string, unknown>;

/**
 * Store 实例类型
 */
export type StoreType<T extends BaseState> = StoreApi<T>;

/**
 * Action 类型定义
 */
export type Action<T extends BaseState, P extends unknown[] = unknown[], R = void> = (
    this: StoreType<T>,
    ...args: P
) => R;

/**
 * 异步 Action 类型定义
 */
export type AsyncAction<T extends BaseState, P extends unknown[] = unknown[], R = void> = (
    this: StoreType<T>,
    ...args: P
) => Promise<R>;

/**
 * Getter 类型 - 用于计算派生状态
 */
export type Getter<T extends BaseState, R = unknown> = (state: T) => R;

/**
 * Store 选择器类型
 */
export type Selector<T extends BaseState, R = unknown> = (state: T) => R;

/**
 * 状态更新函数类型
 */
export type PartialState<T extends BaseState> = Partial<T> | ((state: Draft<T>) => void);

/**
 * Store 配置选项
 */
export interface StoreConfig<T extends BaseState, P = T> {
    /** Store 名称，用于调试 */
    name: string;
    /** 是否启用开发工具 */
    devtools?: boolean;
    /** 开发工具配置 */
    devtoolsOptions?: DevtoolsOptions;
    /** 是否启用持久化 */
    persist?: boolean;
    /** 持久化配置 */
    persistOptions?: PersistOptions<T, P>;
}

/**
 * Immer 中间件配置
 */
export interface ImmerConfig<T extends BaseState> {
    /** 是否启用 immer 中间件 */
    enabled: boolean;
    /** 深度更新状态的函数 */
    deepUpdate: (state: Draft<T>, partial: PartialState<T>) => void;
}

/**
 * Store Hook 返回类型
 */
export interface StoreHook<T extends BaseState> {
    /** 获取完整状态 */
    useStore: () => T;
    /** 获取选择器结果 */
    useSelector: <R = T>(selector: Selector<T, R>) => R;
    /** 获取多个选择器结果 */
    useSelectors: <R extends unknown[]>(selectors: {
        [K in keyof R]: Selector<T, R[K]>;
    }) => R;
    /** 获取状态和 actions */
    useStoreActions: <A extends Record<string, unknown> = Record<string, unknown>>(
        actionsSelector?: (state: T) => A,
    ) => [T, A];
}

/**
 * 订阅回调类型
 */
export type SubscribeCallback<T extends BaseState> = (state: T, previousState: T) => void;

/**
 * 订阅选项
 */
export interface SubscribeOptions {
    /** 是否立即执行一次回调 */
    fireImmediately?: boolean;
    /** 是否在变化前触发 */
    equalityFn?: (a: unknown, b: unknown) => boolean;
}

/**
 * 中间件类型
 */
export type Middlewares = Array<['zustand/devtools', DevtoolsOptions] | ['zustand/immer', never]>;

/**
 * 持久化存储类型
 */
export interface PersistStorage {
    getItem: (name: string) => StorageValue<unknown> | null | Promise<StorageValue<unknown> | null>;
    setItem: (name: string, value: StorageValue<unknown>) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
}

/**
 * 状态版本控制
 */
export interface PersistVersion<T extends BaseState> {
    version: number;
    migrate: (persistedState: unknown, version: number) => T | Promise<T>;
}

/**
 * Hybrid 状态类型 - 结合普通状态和异步操作
 */
export interface HybridState<T extends BaseState> extends BaseState {
    /** 原始状态数据 */
    data: T;
    /** 加载状态 */
    _isLoading?: boolean;
    /** 错误信息 */
    _error?: Error | string | null;
    /** 最后更新时间 */
    _lastUpdate?: number;
}

/**
 * 异步操作配置
 */
export interface AsyncOperationConfig<T extends BaseState, R> {
    /** 操作前回调 */
    onBefore?: (state: T) => void;
    /** 操作成功回调 */
    onSuccess?: (state: T, result: R) => void;
    /** 操作失败回调 */
    onError?: (state: T, error: Error) => void;
    /** 操作完成回调 */
    onFinally?: (state: T) => void;
}

/**
 * Store 元数据
 */
export interface StoreMetadata {
    /** Store 创建时间 */
    createdAt: number;
    /** Store 版本 */
    version: string;
    /** 最后更新时间 */
    lastUpdate: number;
}

/**
 * 状态合并策略
 */
export type MergeStrategy = 'shallow' | 'deep' | 'replace';

/**
 * 深度合并选项
 */
export interface DeepMergeOptions {
    /** 数组合并策略 */
    arrayMerge?: 'concat' | 'replace' | 'merge-by-index';
    /** 是否克隆对象 */
    clone?: boolean;
}
