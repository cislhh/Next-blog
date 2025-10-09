// 透传配置状态与dispatch
import { createContext } from 'react';

import type { ThemeContextType, ThemeState } from './types';

export const defaultThemeConfig: ThemeState = {
    mode: 'light',
    compact: false,
};
// ...
export const ThemeContext = createContext<ThemeContextType | null>(null);
