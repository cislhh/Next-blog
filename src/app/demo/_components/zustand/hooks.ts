import { use } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';

import type { LayoutState } from './types';

import { LayoutContext } from './constants';

/**
 * 状态选择器
 * @param selector
 */
export function useLayoutContext<T>(selector: (state: LayoutState) => T): T {
    const store = use(LayoutContext);
    if (!store) throw new Error('Missing LayoutContext in the tree');
    return useStore(store, useShallow(selector));
}
