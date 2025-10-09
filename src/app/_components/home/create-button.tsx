'use client';

import type { FC } from 'react';

import { isNil } from 'lodash';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { Button as CNButton } from '../shadcn/ui/button';

export const Button: FC = () => {
    const searchParams = useSearchParams();
    const getUrlQuery = useMemo(() => {
        const query = new URLSearchParams(searchParams.toString()).toString();
        // 保留当前分页的url查询，不至于在打开创建文章后，导致首页的文章列表重置分页
        return isNil(query) || query.length < 1 ? '' : `?${query}`;
    }, [searchParams]);
    return (
        <CNButton asChild className="ml-auto justify-end rounded-sm" variant="outline">
            <Link href={`/posts/create${getUrlQuery}`}>
                <Plus />
                创建
            </Link>
        </CNButton>
    );
};

export const PostCreateButton: FC = () => (
    <Suspense>
        <Button />
    </Suspense>
);
