/**
 * Zustand Store 使用示例 - Shopping Cart 购物车
 *
 * 演示功能:
 * - 复杂数据结构管理
 * - 数组操作
 * - 计算属性
 * - 批量更新
 */

import type { Action, Getter } from '../types';

import { createImmerStore, createStoreHelper } from '../base';
import { createUseStore, createGetterHook } from '../hooks';

// ==================== 类型定义 ====================

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
        size?: string;
        color?: string;
    };
}

interface CartState {
    items: CartItem[];
    couponCode: string | null;
    discount: number;
    taxRate: number;
    shipping: number;
}

interface CartActions {
    addItem: Action<
        CartState,
        [
            {
                productId: string;
                name: string;
                price: number;
                image?: string;
                variant?: { size?: string; color?: string };
            }
        ]
    >;
    removeItem: Action<CartState, [itemId: string]>;
    updateQuantity: Action<CartState, [itemId: string, quantity: number]>;
    clearCart: Action<CartState>;
    applyCoupon: Action<CartState, [code: string, discount: number]>;
    removeCoupon: Action<CartState>;
    setTaxRate: Action<CartState, [rate: number]>;
    setShipping: Action<CartState, [cost: number]>;
}

type CartStore = CartState & CartActions;

// ==================== Store 创建 ====================

const initialCartState: CartState = {
    items: [],
    couponCode: null,
    discount: 0,
    taxRate: 0.1,
    shipping: 0,
};

const cartActions: CartActions = {
    addItem({ productId, name, price, image, variant }) {
        const state = this.getState();
        const existingItemIndex = state.items.findIndex(
            (item) =>
                item.productId === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingItemIndex >= 0) {
            // 更新数量
            const items = [...state.items];
            items[existingItemIndex] = {
                ...items[existingItemIndex],
                quantity: items[existingItemIndex].quantity + 1,
            };
            this.setState({ items });
        } else {
            // 添加新商品
            const newItem: CartItem = {
                id: `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                productId,
                name,
                price,
                quantity: 1,
                image,
                variant,
            };
            this.setState({ items: [...state.items, newItem] });
        }
    },
    removeItem(itemId) {
        const state = this.getState();
        const items = state.items.filter((item) => item.id !== itemId);
        this.setState({ items });
    },
    updateQuantity(itemId, quantity) {
        const state = this.getState();
        if (quantity <= 0) {
            const items = state.items.filter((item) => item.id !== itemId);
            this.setState({ items });
        } else {
            const items = state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            );
            this.setState({ items });
        }
    },
    clearCart() {
        this.setState({ items: [], couponCode: null, discount: 0 });
    },
    applyCoupon(code, discount) {
        this.setState({ couponCode: code, discount });
    },
    removeCoupon() {
        this.setState({ couponCode: null, discount: 0 });
    },
    setTaxRate(rate) {
        this.setState({ taxRate: rate });
    },
    setShipping(cost) {
        this.setState({ shipping: cost });
    },
};

export const useCartStore = createImmerStore(
    { ...initialCartState, ...cartActions } as CartStore,
    {
        name: 'cart-store',
    }
);

// ==================== 派生状态 (Getters) ====================

// 购物车商品总数
const getTotalItems: Getter<CartStore, number> = (state) => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
};

// 小计（不含税和运费）
const getSubtotal: Getter<CartStore, number> = (state) => {
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// 折扣金额
const getDiscountAmount: Getter<CartStore, number> = (state) => {
    const subtotal = getSubtotal(state);
    return subtotal * (state.discount / 100);
};

// 税额
const getTaxAmount: Getter<CartStore, number> = (state) => {
    const subtotal = getSubtotal(state);
    const discountAmount = getDiscountAmount(state);
    return (subtotal - discountAmount) * state.taxRate;
};

// 总计
const getTotal: Getter<CartStore, number> = (state) => {
    const subtotal = getSubtotal(state);
    const discountAmount = getDiscountAmount(state);
    const taxAmount = getTaxAmount(state);
    return subtotal - discountAmount + taxAmount + state.shipping;
};

// 购物车汇总
const getCartSummary: Getter<
    CartStore,
    {
        totalItems: number;
        subtotal: number;
        discount: number;
        tax: number;
        shipping: number;
        total: number;
    }
> = (state) => {
    return {
        totalItems: getTotalItems(state),
        subtotal: getSubtotal(state),
        discount: getDiscountAmount(state),
        tax: getTaxAmount(state),
        shipping: state.shipping,
        total: getTotal(state),
    };
};

// ==================== Hooks 创建 ====================

const { useStore, useSelector, useShallowSelector } = createUseStore(useCartStore);

export const useCartState = () => useStore();
export const useCartItems = () => useSelector((s) => s.items);
export const useCoupon = () => useSelector((s) => ({ code: s.couponCode, discount: s.discount }));

// 创建 Getter Hook
const createGetter = createGetterHook(useCartStore);

export const useTotalItems = () => createGetter(getTotalItems);
export const useSubtotal = () => createGetter(getSubtotal);
export const useCartSummary = () => createGetter(getCartSummary);
export const useCartTotal = () => createGetter(getTotal);

// ==================== Store Helper 示例 ====================

const cartHelper = createStoreHelper(useCartStore);

// 批量更新购物车
cartHelper.addAction('batchUpdate', function (updates: Array<{ itemId: string; quantity: number }>) {
    const state = this.getState();
    const items = state.items.map((item) => {
        const update = updates.find((u) => u.itemId === item.id);
        if (update && update.quantity <= 0) {
            return null;
        }
        if (update) {
            return { ...item, quantity: update.quantity };
        }
        return item;
    }).filter((item): item is CartItem => item !== null);
    this.setState({ items });
});

// ==================== 使用示例 ====================

/**
 * 组件使用示例:
 *
 * function ShoppingCart() {
 *   const items = useCartItems();
 *   const summary = useCartSummary();
 *   const { addItem, removeItem, updateQuantity, clearCart } = useCartState();
 *
 *   return (
 *     <div>
 *       <h1>Shopping Cart</h1>
 *       <p>Total Items: {summary.totalItems}</p>
 *
 *       {items.length === 0 ? (
 *         <p>Your cart is empty</p>
 *       ) : (
 *         <>
 *           {items.map((item) => (
 *             <CartItem
 *               key={item.id}
 *               item={item}
 *               onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
 *               onRemove={() => removeItem(item.id)}
 *             />
 *           ))}
 *
 *           <CartSummary summary={summary} />
 *           <button onClick={clearCart}>Clear Cart</button>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 */
