'use client';

import type { FC } from 'react';

import { cn } from '../shadcn/utils';
import { BackButton } from './back-button';
import { PostCreateButton } from './create-button';
import $styles from './tools.module.css';

export const Tools: FC<{ back?: boolean; className?: string }> = ({ back, className }) => {
    return (
        <div className={cn($styles.tools, className)}>
            {back && <BackButton />}
            <PostCreateButton />
        </div>
    );
};
