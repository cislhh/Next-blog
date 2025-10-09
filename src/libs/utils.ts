import { base, en, Faker, zh_CN } from '@faker-js/faker';
import deepmerge from 'deepmerge';
import { isNil } from 'lodash';

import type { PaginateOptions, PaginateReturn } from '@/database/types';

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

/**
 * 数据分页函数
 * @param data
 * @param options
 */
/**
 * 数据分页函数
 * @param data
 * @param options
 */
export const paginate = async <T extends Record<string, any>>(
    data: T[],
    options: PaginateOptions,
): Promise<PaginateReturn<T>> => {
    // 当设置每页数据量小于1时，则设置为每页一条数据
    const limit = isNil(options.limit) || options.limit < 1 ? 1 : options.limit;
    // 如果当前页小于1，则设置当前页为第一页
    const page = isNil(options.page) || options.page < 1 ? 1 : options.page;
    // 起始数据游标，如果页面是第一页则从第1条数据开始截取，如果大于第一页则从当前页的第一条数据开始截取
    const start = page > 1 ? (page - 1) * limit + 1 : 0;
    const items = data.slice(start, start + limit);
    // 页面数量
    const totalPages =
        data.length % limit === 0
            ? Math.floor(data.length / limit)
            : Math.floor(data.length / limit) + 1;
    // 计算最后一页的数据量
    const remainder = data.length % limit !== 0 ? data.length % limit : limit;
    // 根据最优一页的数据量得出当前页面的数据量
    const itemCount = page < totalPages ? limit : remainder;
    return {
        items,
        meta: {
            totalItems: data.length,
            itemCount,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
    };
};
/**
 * 创建faker实例
 */
export const faker = new Faker({
    locale: [zh_CN, en, base],
});
