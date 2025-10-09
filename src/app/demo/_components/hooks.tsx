'use client';

import type { DependencyList, EffectCallback } from 'react';

import { isEqual, isNil } from 'lodash';
import { use, useCallback, useEffect, useMemo, useRef } from 'react';

import type { LocaleType } from './context/types';
import type { ThemeAction } from './reducer/types';

import { LocaleContext, locales } from './context/constants';
import { defaultThemeConfig, ThemeContext } from './reducer/constants';

// ...
/**
 * 获取主题状态
 */
export const useTheme = () => {
    const context = use(ThemeContext) ?? ({} as Record<string, any>);
    return useMemo(
        () => (isNil(context.state) ? defaultThemeConfig : context.state),
        [context.state],
    );
};

/**
 * 获取主题操作方法
 */
export const useThemeAction = () => {
    const context = use(ThemeContext) ?? ({} as Record<string, any>);
    return useCallback(isNil(context.dispatch) ? (_params: ThemeAction) => {} : context.dispatch, [
        context.dispatch,
    ]);
};

/**
 *
 */
export const useLocale = () => {
    const context = use(LocaleContext) ?? ({} as Record<string, any>);
    return useMemo(() => (isNil(context.locale) ? locales[0] : context.locale), [context.locale]);
};

/**
 *  获取语言切换方法
 */
export const useLocaleAction = () => {
    const context = use(LocaleContext) ?? ({} as Record<string, any>);
    return useCallback(isNil(context.setLocale) ? (_locale: LocaleType) => {} : context.setLocale, [
        context.setLocale,
    ]);
};
/**
 * 首次渲染不执行，在依赖变化时执行effect
 * @param effect
 * @param deps
 */
export const useUpdateEffect = (effect: EffectCallback, deps?: DependencyList) => {
    const inited = useRef(deps);
    useEffect(() => {
        if (!isEqual(inited.current, deps)) {
            inited.current = deps;
            effect();
        }
    }, [deps]);
};
