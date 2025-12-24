/**
 * Zustand Store 使用示例 - Counter 计数器
 *
 * 演示功能:
 * - 基础状态管理
 * - Actions 定义
 * - Hooks 使用
 */

import type { Action } from '../types';

import { createImmerStore, createStoreWithActions, createStoreHelper } from '../base';
import { createUseStore } from '../hooks';

// ==================== 类型定义 ====================

interface CounterState {
    count: number;
    step: number;
}

interface CounterActions {
    increment: Action<CounterState>;
    decrement: Action<CounterState>;
    reset: Action<CounterState>;
    setStep: Action<CounterState, [number]>;
    incrementBy: Action<CounterState, [number]>;
}

type CounterStore = CounterState & CounterActions;

// ==================== 方式一：使用 createStoreWithActions ====================

const initialCounterState: CounterState = {
    count: 0,
    step: 1,
};

const counterActions: CounterActions = {
    increment() {
        const state = this.getState();
        this.setState({ count: state.count + state.step });
    },
    decrement() {
        const state = this.getState();
        this.setState({ count: state.count - state.step });
    },
    reset() {
        this.setState(initialCounterState);
    },
    setStep(step) {
        this.setState({ step });
    },
    incrementBy(amount) {
        const state = this.getState();
        this.setState({ count: state.count + amount });
    },
};

export const useCounterStore = createStoreWithActions(initialCounterState, counterActions, {
    name: 'counter-store',
});

// 创建 hooks
const { useStore, useSelector, useShallowSelector } = createUseStore(useCounterStore);

// 导出便捷 hooks
export const useCounter = () => useStore();
export const useCount = () => useSelector((state) => state.count);
export const useCounterStep = () => useSelector((state) => state.step);
export const useCounterShallow = () => useShallowSelector((state) => ({ count: state.count, step: state.step }));

// ==================== 方式二：使用 createImmerStore + StoreHelper ====================

export const counterStoreV2 = createImmerStore(initialCounterState, {
    name: 'counter-store-v2',
});

// 使用 StoreHelper 管理 store
const counterHelper = createStoreHelper(counterStoreV2);

// 添加 actions
counterHelper.addAction('increment', function () {
    const state = this.getState();
    this.setState({ count: state.count + state.step });
});

counterHelper.addAction('decrement', function () {
    const state = this.getState();
    this.setState({ count: state.count - state.step });
});

counterHelper.addAction('incrementBy', function (amount: number) {
    const state = this.getState();
    this.setState({ count: state.count + amount });
});

// 创建 v2 hooks
const { useStore: useCounterV2, useSelector: useSelectorV2 } = createUseStore(counterStoreV2);

export const useCounterV2Store = () => useCounterV2();
export const useCountV2 = () => useSelectorV2((s) => s.count);

// ==================== 订阅示例 ====================

// 订阅状态变化
const unsubscribe = counterHelper.subscribe((state, previousState) => {
    console.log('Counter changed:', { from: previousState, to: state });
});

// 订阅特定字段
const unsubscribeCount = counterHelper.subscribeTo('count', (value, previousValue) => {
    console.log(`Count changed from ${previousValue} to ${value}`);
});

// ==================== 使用示例 ====================

/**
 * 组件使用示例:
 *
 * function CounterComponent() {
 *   const count = useCount();
 *   const step = useCounterStep();
 *   const { increment, decrement, setStep } = useCounter();
 *
 *   return (
 *     <div>
 *       <h1>Count: {count}</h1>
 *       <p>Step: {step}</p>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *       <button onClick={() => setStep(5)}>Set Step to 5</button>
 *     </div>
 *   );
 * }
 */
