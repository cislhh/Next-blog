import type { FC } from 'react';

import ThemeDemo from '../_components/theme/demo';
import $styles from './page.module.css';

const DemoPage: FC = () => (
    <div className={$styles.demo}>
        {/* <ZustandDemo /> */}、
        <ThemeDemo />
    </div>
);

export default DemoPage;
