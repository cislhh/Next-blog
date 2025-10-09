/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import type { FC, MouseEventHandler } from 'react';

import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '../shadcn/ui/button';
import { cn } from '../shadcn/utils';

export const BackButton: FC = () => {
    const router = useRouter();
    const [historyLength, setHistoryLength] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHistoryLength(window.history.length);
        }
    }, []);
    const goBack: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            e.preventDefault();
            if (historyLength > 1) router.back();
        },
        [historyLength],
    );

    return (
        <Button
            variant="outline"
            className={cn('rounded-sm', {
                'pointer-events-none opacity-50': historyLength <= 1,
            })}
            disabled={historyLength <= 1}
            aria-disabled={historyLength <= 1}
            onClick={goBack}
        >
            <Undo2 />
            返回
        </Button>
    );
};
