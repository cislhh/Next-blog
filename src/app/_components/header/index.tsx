import type { FC } from 'react';

import { ShadcnThemeSetting } from '../theme/setting';
import { HeaderLogo } from './logo';
import $styles from './styles.module.css';

export const Header: FC = () => (
    <header className={$styles.header}>
        <HeaderLogo />
        <div className="mt-5">
            <ShadcnThemeSetting />
        </div>
    </header>
);
