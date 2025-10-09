/**
 * 语言类型
 */
export interface LocaleType {
    /**
     * 语言名称
     */
    name: string;
    /**
     * 语言标签
     */
    label: string;
}

/**
 * 语言状态
 */
export interface LocaleState {
    locale: LocaleType;
    setLocale: (locale: LocaleType) => void;
}
