'use client';
import type { FC } from 'react';

import useScroll from '@/libs/broswer';

import { cn } from '../shadcn/utils';
import { HeaderLogo } from './logo';
import { HeaderNav } from './nav';
import $styles from './styles.module.css';
import { HeaderTools } from './tools';
export const Header: FC = () => {
    const scrolled = useScroll(50);

    return (
        <header
            className={cn($styles.header, 'page-item', {
                [$styles['header-scrolled']]: scrolled,
                [$styles['header-unscrolled']]: !scrolled,
            })}
        >
            <div className={cn('page-container', $styles.container)}>
                <HeaderLogo />
                <HeaderNav />
                <HeaderTools />
            </div>
        </header>
    );
};
