'use client';

import { FC, Suspense, useMemo } from 'react';
import { Button as CNButton } from '../shadcn/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isNil } from 'lodash';
export const Button: FC = () => {
    const searchParams = useSearchParams();
    const getUrlQuery = useMemo(() => {
        const query = new URLSearchParams(searchParams.toString()).toString();
        return isNil(query) || query.length < 1 ? '' : `?${query}`;
    }, [searchParams]);

    return (
        <CNButton asChild className='ml-auto justify-end rounded-sm' variant='outline'>
            <Link href={`/posts/create${getUrlQuery}`}>
                <Plus />
                创建
            </Link>
        </CNButton>
    );
};

export const PostCreateButton: FC = () => {
    return (
        <Suspense>
            <Button />
        </Suspense>
    );
};
