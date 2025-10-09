'use client';

import type { FC } from 'react';

import { Button } from 'antd';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';

import $styles from './style.module.css';

const ChildCom1: FC<{ value: number }> = () => {
    console.log('渲染子组件1');
    return null;
};
const ChildCom2: FC<{ value: number }> = () => {
    console.log('渲染子组件2');
    return null;
};
const Info: FC<{ call: () => void }> = memo(() => {
    console.log('渲染消息');
    return null;
});

export const CallbackDemo: FC = () => {
    const [, setCount] = useState<number>(0);
    const changeCount = () => setCount(Math.ceil(Math.random() * 10));
    const getInfo = () => {};
    useEffect(() => {
        console.log('getInfo函数的值改变');
    }, [getInfo]);
    return (
        <div className={clsx($styles.container, 'w-[20rem]')}>
            <h2 className="text-center">useCallback Demo</h2>
            <div className="flex justify-around">
                <Info call={getInfo} />
                <Button onClick={changeCount} type="dashed">
                    变化count1
                </Button>
            </div>
        </div>
    );
};
const MemoDemo: FC = () => {
    const [count1, setCount1] = useState<number>(0);
    const [count2, setCount2] = useState<number>(0);
    return (
        <div className={clsx($styles.container, 'w-[20rem]')}>
            <h2 className="text-center">useMemo Demo</h2>
            <div className="flex justify-around">
                <Button onClick={() => setCount1(Math.ceil(Math.random() * 10))} type="dashed">
                    变化coun1
                </Button>
                <Button onClick={() => setCount2(Math.ceil(Math.random() * 10))} type="dashed">
                    变化coun2
                </Button>
            </div>
            <div className="flex justify-around">
                <ChildCom1 value={count1} />
                <ChildCom2 value={count2} />
            </div>
        </div>
    );
};
export default MemoDemo;
