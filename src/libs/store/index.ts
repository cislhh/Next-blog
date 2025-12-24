/**
 * Zustand Store 工具库
 *
 * 提供了一套完整的 Zustand 状态管理封装工具，包括:
 * - 类型定义
 * - Store 创建函数
 * - React Hooks
 * - 工具类和辅助函数
 *
 * @example 基础用法
 * ```ts
 * import { createImmerStore, createUseStore } from '@/libs/store';
 *
 * interface MyState {
 *   count: number;
 *   increment: Action<MyState>;
 * }
 *
 * const store = createImmerStore<MyState>({ count: 0 }, { name: 'my-store' });
 * const { useStore, useSelector } = createUseStore(store);
 * ```
 */

// ==================== 类型导出 ====================

export type {
    // 基础类型
    BaseState,
    StoreType,
    // Action 类型
    Action,
    AsyncAction,
    // 状态操作类型
    PartialState,
    Selector,
    Getter,
    // 配置类型
    StoreConfig,
    DevtoolsOptions,
    PersistOptions,
    // Hook 类型
    StoreHook,
    // 订阅类型
    SubscribeCallback,
    SubscribeOptions,
    // 持久化类型
    PersistStorage,
    PersistVersion,
    // 元数据类型
    StoreMetadata,
    // 合并策略
    MergeStrategy,
    DeepMergeOptions,
    // Immer 配置
    ImmerConfig,
    // 中间件类型
    Middlewares,
} from './types';

export type { HybridState, AsyncOperationConfig } from './types';

// ==================== 基础操作导出 ====================

export {
    // Store 创建
    createStore,
    createImmerStore,
    createPersistStore,
    createStoreWithActions,
    createHybridStore,
    // Store Helper
    StoreHelper,
    createStoreHelper,
    // 异步操作
    wrapAsyncOperation,
} from './base';

// ==================== Hooks 导出 ====================

export {
    // 基础 Hooks
    createUseStore,
    // Actions Hooks
    createActionsHook,
    createStoreActionsHook,
    // Hybrid Hooks
    createHybridHook,
    // 订阅 Hooks
    useStoreSubscription,
    // 派生状态 Hooks
    createDerivedState,
    createGetterHook,
    createSelectorsHook,
    // 字段 Hooks
    useStoreField,
    useStoreFields,
    // 历史 Hooks
    useHistoryState,
} from './hooks';

// ==================== 保留原有 API (兼容性) ====================

export { createStore as createStoreFunction } from './base';

// ==================== 重新导出原始 zustand (可选) ====================

// 如果需要直接使用原始 zustand，可以取消下面的注释
// export * from 'zustand';
// export * from 'zustand/middleware';
