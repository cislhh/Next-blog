'use client';

import type { FC } from 'react';

import { Button } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';

import { useUpdateEffect } from './hooks';
import $styles from './style.module.css';

const CustomDemo: FC = () => {
    const [count, setCount] = useState(0);
    useUpdateEffect(() => {
        console.log('changed');
    }, [count]);
    return (
        <div className={clsx($styles.container, 'w-80')}>
            <h2 className="text-center">Custom Demo</h2>
            <p className="py-5 text-center">{count}</p>
            <div className="flex justify-around">
                <Button onClick={() => setCount(Math.ceil(Math.random() * 10))} type="dashed">
                    变化
                </Button>
            </div>
        </div>
    );
};
export default CustomDemo;
