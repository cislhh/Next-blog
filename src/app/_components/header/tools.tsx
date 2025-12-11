'use client';
import type { FC } from 'react';

import { PostCreateButton } from '../post/create-button';
import { ShadcnThemeSetting } from '../theme/setting';
import $styles from './tools.module.css';

export const HeaderTools: FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
    return (
        <div className={$styles.tools}>
            <div className="flex">
                <PostCreateButton iconBtn={isMobile} />
            </div>
            <ShadcnThemeSetting />
        </div>
    );
};
