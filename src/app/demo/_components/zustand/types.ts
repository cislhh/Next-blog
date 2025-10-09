import type { LayoutComponent, LayoutMode } from './constants';
import type { createLayoutStore } from './store';

/**
 * 主题颜色模式
 */
export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
}
/**
 * 布局配置
 */
export interface LayoutOptions {
    /** 布局模式 */
    mode: `${LayoutMode}`;
    /** 布局组件主题色 */
    theme: Partial<LayoutTheme>;
}

export interface LayoutActions {
    /** 更改布局模式 */
    changeMode: (value: `${LayoutMode}`) => void;
    /** 更改主题 */
    changeTheme: (value: Partial<LayoutTheme>) => void;
}

/**
 * 布局组件主题色
 */
export type LayoutTheme = { [key in `${LayoutComponent}`]: `${ThemeMode}` };
export type LayoutState = LayoutOptions & LayoutActions;
export type LayoutStoreType = ReturnType<typeof createLayoutStore>;
