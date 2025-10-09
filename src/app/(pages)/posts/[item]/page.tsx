import type { FC } from 'react';

import { isNil } from 'lodash';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Tools } from '@/app/_components/home/tools';
import { cn } from '@/app/_components/shadcn/utils';
import { queryPostItem } from '@/app/actions/post';

import $styles from './page.module.css';

const PostItemPage: FC<{ params: Promise<{ item: string }> }> = async ({ params }) => {
    const { item } = await params;
    const post = await queryPostItem(item);
    if (isNil(post)) return notFound();
    return (
        <div className="page-item">
            <Tools className="page-container" back />
            <div className={cn('page-container', $styles.item)}>
                <div className={$styles.thumb}>
                    <Image
                        src={post.thumb}
                        alt={post.title}
                        fill
                        priority
                        sizes="100%"
                        unoptimized
                    />
                </div>

                <div className={$styles.content}>
                    <header className={$styles.title}>
                        <h1>{post.title}</h1>
                    </header>
                    <div className={$styles.meta}>
                        <div>
                            <span>
                                <Calendar />
                            </span>
                            <time className="ellips">2024年8月10日</time>
                        </div>
                    </div>
                    <div className={$styles.body}>{post.body}</div>
                </div>
            </div>
        </div>
    );
};
export default PostItemPage;
