import type { FC } from 'react';
import { IPaginateQueryProps } from '../_components/paginate/types';
import { isNil } from 'lodash';
import { queryPostPaginate } from '../actions/post';
import { redirect } from 'next/navigation';
import { Tools } from '../_components/home/tools';
import { cn } from '../_components/shadcn/utils';
import $styles from './page.module.css'
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { PostListPaginate } from '../_components/post/paginate';

const HomePage: FC<{ searchParams: IPaginateQueryProps }> = async ({ searchParams }) => {
    const { page: currentPage, limit = 8 } = searchParams;

    const page = isNil(currentPage) || Number(currentPage) < 1 ? 1 : Number(currentPage);

    const { items, meta } = await queryPostPaginate({ page: Number(page), limit });

    if (meta.totalPages && meta.totalPages > 0 && page > meta.totalPages) {
        return redirect('/');
    }
    return (
        <div className="page-item">
            <Tools className="page-container" />
             <div className={cn('page-container', $styles.list)}>
                {items.map((item) => (
                    <div
                        className={$styles.item}
                        // 传入css变量的封面图用于鼠标移动到此处后会出现不同颜色的光晕效果
                        style={{ '--bg-img': `url(${item.thumb})` } as any}
                        key={item.id}
                    >
                        <Link className={$styles.thumb} href={`/posts/${item.id}`}>
                            <Image
                                src={item.thumb}
                                alt={item.title}
                                fill
                                priority
                                sizes="100%"
                                unoptimized
                            />
                        </Link>
                        <div className={$styles.content}>
                            <div className={$styles.title}>
                                <Link href={`/posts/${item.id}`}>
                                    <h2 className="ellips animate-decoration animate-decoration-lg">
                                        {item.title}
                                    </h2>
                                </Link>
                            </div>
                            <div className={$styles.summary}>
                                {isNil(item.summary) ? item.body.substring(0, 99) : item.summary}
                            </div>
                            <div className={$styles.footer}>
                                <div className={$styles.meta}>
                                    <span>
                                        <Calendar />
                                    </span>
                                    <time className="ellips">2024年8月10日</time>
                                </div>
                                {/* 文章操作按钮 */}
                            </div>
                        </div>
                    </div>
                ))}
                {/* 分页组件 */}
                {meta.totalPages !> 1 && <PostListPaginate limit={5} page={page}></PostListPaginate>}
            </div>
        </div>
    );
};

export default HomePage;
