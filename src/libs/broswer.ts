'use client';

import { useEffect, useState } from 'react';

/**
 * 监听滚动条位置
 */

export default function useScroll(threshold = 0) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return scrolled;
}
