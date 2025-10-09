import { createContext } from 'react';

import type { LayoutStoreType } from './types';

/**
 * 布局模式
 */
export enum LayoutMode {
    /** 只有顶栏导航 */
    TOP = 'top',
    /** 侧边导航,顶栏自定义 */
    SIDE = 'side',
    /** 同side,但是LOGO在顶栏 */
    CONTENT = 'content',
}
/**
 * 布局组件
 */
export enum LayoutComponent {
    /** 顶栏 */
    HEADER = 'header',
    /** 侧边栏 */
    SIDEBAR = 'sidebar',
}

export enum LayoutActionType {
    /** 更改布局模式 */
    CHANGE_MODE = 'change_mode',
    /** 更改组件主题 */
    CHANGE_THEME = 'change_theme',
}

/**
 * 状态上下文包装器
 */
export const LayoutContext = createContext<LayoutStoreType | null>(null);
