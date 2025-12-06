import type { FC } from 'react';

import { PostCreateButton } from '../home/create-button';
import { ShadcnThemeSetting } from '../theme/setting';
import $styles from './tools.module.css';

export const HeaderTools: FC = () => {
    return (
        <div className={$styles.tools}>
            <PostCreateButton />
            <ShadcnThemeSetting />
        </div>
    );
};
