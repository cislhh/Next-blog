'use client';

import type { FC } from 'react';

import { cn } from '../shadcn/utils';
import { PostDelete } from './delete';
import { PostEditButton } from './edit-button';

export const Buttons: FC<{ id: string; className?: string }> = ({ id, className }) => {
    return (
        <div className={cn('flex items-center [&>time]:ml-2', className)}>
            <PostEditButton id={id} />
            <PostDelete id={id} />
        </div>
    );
};

export const PostActions: FC<{ id: string; className?: string }> = ({ id, className }) => (
    <Buttons id={id} className={className} />
);
