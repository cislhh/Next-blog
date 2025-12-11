'use client';

import { FC, Suspense } from 'react';
import { useUrlQuery } from '@/libs/url';
import { Button as CNButton } from '../shadcn/ui/button';
import { cn } from '../shadcn/utils';
import Link from 'next/link';
import { Plus } from 'lucide-react';
export const Button: FC<{ iconBtn?: boolean }> = ({ iconBtn }) => {
    const urlQuery = useUrlQuery();

    return (
        <CNButton
            asChild
            className={cn('ml-auto', {
                'focus-visible:!ring-0': !iconBtn,
                'rounded-sm': !iconBtn,
            })}
            variant="secondary"
            size={iconBtn ? 'icon' : 'default'}
        >
            <Link href={`/posts/create${urlQuery}`}>
                <Plus />
                {!iconBtn && '创建'}
            </Link>
        </CNButton>
    );
};

export const PostCreateButton: FC<{ iconBtn?: boolean }> = ({ iconBtn = false }) => (
    <Suspense>
        <Button iconBtn={iconBtn} />
    </Suspense>
);
