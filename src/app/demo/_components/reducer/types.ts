import type { Dispatch } from 'react';

/**
 * 主题颜色模式
 */
export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
}

/**
 * 主题状态
 */
export interface ThemeState {
    /**
     * 当前主题颜色模式
     */
    mode: `${ThemeMode}`;
    /**
     * 是否紧凑模式
     */
    compact: boolean;
}

/**
 * 主题操作类型
 */
export enum ThemeActionType {
    /**
     * 切换主题颜色模式
     */
    CHANGE_MODE = 'change_mode',
    /**
     * 切换紧凑模式
     */
    CHANGE_COMPACT = 'change_compact',
}

/**
 * 主题操作
 */
export type ThemeAction =
    | { type: `${ThemeActionType.CHANGE_MODE}`; value: `${ThemeMode}` }
    | { type: `${ThemeActionType.CHANGE_COMPACT}`; value: boolean };

/** 主题状态上下文类型 */
export interface ThemeContextType {
    state: ThemeState;
    dispatch: Dispatch<ThemeAction>;
}
