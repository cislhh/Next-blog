'use client';

import { useEffect, useRef, useState, type FC } from 'react';

/**
 * 动态渐变背景组件
 * 包含：
 * 1. 自动流动的渐变色背景
 * 2. 浮动的光斑动画
 * 3. 鼠标跟随的交互光晕
 */
export const AnimatedBackground: FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseGlowRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMouseInView, setIsMouseInView] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        const mouseGlow = mouseGlowRef.current;
        if (!container || !mouseGlow) return;

        // 鼠标位置跟踪（使用 RAF 优化）
        let animationId: number;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const animate = () => {
            // 平滑缓动
            const ease = 0.06;
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;

            mouseGlow.style.left = `${currentX}px`;
            mouseGlow.style.top = `${currentY}px`;

            animationId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
            setMousePos({ x: e.clientX, y: e.clientY });

            if (!isMouseInView) setIsMouseInView(true);
        };

        const handleMouseLeave = () => setIsMouseInView(false);
        const handleMouseEnter = () => setIsMouseInView(true);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        animationId = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            cancelAnimationFrame(animationId);
        };
    }, [isMouseInView]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        >
            {/* ===== 基础渐变背景层 - 自动流动动画 ===== */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        linear-gradient(
                            125deg,
                            rgba(249, 250, 251, 1) 0%,
                            rgba(243, 244, 246, 1) 25%,
                            rgba(238, 242, 255, 1) 50%,
                            rgba(243, 244, 246, 1) 75%,
                            rgba(249, 250, 251, 1) 100%
                        )
                    `,
                    backgroundSize: '400% 400%',
                    animation: 'gradientFlow 15s ease infinite',
                }}
            />

            {/* 暗色模式背景 */}
            <div
                className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
                style={{
                    background: `
                        linear-gradient(
                            125deg,
                            rgba(9, 9, 11, 1) 0%,
                            rgba(24, 24, 27, 1) 25%,
                            rgba(30, 27, 45, 1) 50%,
                            rgba(24, 24, 27, 1) 75%,
                            rgba(9, 9, 11, 1) 100%
                        )
                    `,
                    backgroundSize: '400% 400%',
                    animation: 'gradientFlow 15s ease infinite',
                }}
            />

            {/* ===== 浮动光斑层 ===== */}
            {/* 光斑1 - 紫色 */}
            <div
                className="absolute rounded-full opacity-30 dark:opacity-20"
                style={{
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                    top: '10%',
                    left: '15%',
                    filter: 'blur(80px)',
                    animation: 'floatBlob1 20s ease-in-out infinite',
                }}
            />

            {/* 光斑2 - 蓝色 */}
            <div
                className="absolute rounded-full opacity-25 dark:opacity-15"
                style={{
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                    top: '50%',
                    right: '10%',
                    filter: 'blur(80px)',
                    animation: 'floatBlob2 18s ease-in-out infinite',
                }}
            />

            {/* 光斑3 - 青色 */}
            <div
                className="absolute rounded-full opacity-20 dark:opacity-15"
                style={{
                    width: '450px',
                    height: '450px',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%)',
                    bottom: '15%',
                    left: '25%',
                    filter: 'blur(80px)',
                    animation: 'floatBlob3 22s ease-in-out infinite',
                }}
            />

            {/* 光斑4 - 粉色（点缀） */}
            <div
                className="absolute rounded-full opacity-15 dark:opacity-10"
                style={{
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
                    top: '60%',
                    left: '5%',
                    filter: 'blur(70px)',
                    animation: 'floatBlob4 25s ease-in-out infinite',
                }}
            />

            {/* ===== 鼠标跟随光晕 ===== */}
            <div
                ref={mouseGlowRef}
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '600px',
                    height: '600px',
                    background: `
                        radial-gradient(
                            circle at center,
                            rgba(139, 92, 246, 0.2) 0%,
                            rgba(59, 130, 246, 0.15) 25%,
                            rgba(6, 182, 212, 0.1) 50%,
                            transparent 70%
                        )
                    `,
                    transform: 'translate(-50%, -50%)',
                    opacity: isMouseInView ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    filter: 'blur(60px)',
                }}
            />

            {/* ===== 鼠标位置的小光点 ===== */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)',
                    opacity: isMouseInView ? 0.3 : 0,
                    transition: 'opacity 0.3s ease',
                    filter: 'blur(20px)',
                }}
            />

            {/* ===== 网格纹理叠加（可选，增加质感） ===== */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* ===== CSS 动画定义 ===== */}
            <style jsx>{`
                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes floatBlob1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(50px, 30px) scale(1.1); }
                    50% { transform: translate(20px, -40px) scale(0.95); }
                    75% { transform: translate(-30px, 20px) scale(1.05); }
                }

                @keyframes floatBlob2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(-40px, -30px) scale(1.05); }
                    50% { transform: translate(30px, 50px) scale(0.9); }
                    75% { transform: translate(50px, -20px) scale(1.1); }
                }

                @keyframes floatBlob3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(60px, -40px) scale(1.08); }
                    66% { transform: translate(-40px, 30px) scale(0.92); }
                }

                @keyframes floatBlob4 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    20% { transform: translate(-30px, 50px) scale(1.1); }
                    40% { transform: translate(40px, 20px) scale(0.95); }
                    60% { transform: translate(20px, -30px) scale(1.05); }
                    80% { transform: translate(-50px, -10px) scale(0.98); }
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackground;
