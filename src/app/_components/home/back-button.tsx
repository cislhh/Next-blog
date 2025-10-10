'use client'
import type { FC, MouseEventHandler } from 'react';
import { Undo2 } from 'lucide-react';
import { Button } from '../shadcn/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '../shadcn/utils';

export const BackButton: FC = () => {
    const router = useRouter();

    const [historyLength, setHistoryLength] = useState(0);

    useEffect(() => {
        if (typeof window != 'undefined') {
            setHistoryLength(window.history?.length);
        }
    }, []);

    const goBack: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        e.preventDefault();

        if (typeof window != 'undefined' && historyLength > 1) {
            router.back();
        }else{
            router.replace('/')
        }
    },[historyLength]);

    return (
        <Button variant="outline" className={
            cn('rounded-sm',{'pointer-events-auto opacity-50':historyLength<=1})
        } onClick={goBack}>
            <Undo2 />
            返回
        </Button>
    );
};
