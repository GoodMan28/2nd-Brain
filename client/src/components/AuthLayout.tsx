import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { SecondBrainLogo } from '../components/ui/icons/SecondBrainLogo';

// We'll use standard CSS classes for fonts since this is a Vite project
// If Space Grotesk is not present we'll use a fallback in CSS.

interface AuthLayoutProps {
    children: React.ReactNode | ((isDarkMode: boolean) => React.ReactNode);
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate mouse position relative to center of the container (-1 to 1)
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        mouseX.set(x);
        mouseY.set(y);
    };

    // Smooth physics-based spring for mouse movement
    const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Transforms for the parallax effect
    const backgroundMoveX = useTransform(springX, [-1, 1], [-20, 20]);
    const backgroundMoveY = useTransform(springY, [-1, 1], [-20, 20]);

    const brainMoveX = useTransform(springX, [-1, 1], [-40, 40]);
    const brainMoveY = useTransform(springY, [-1, 1], [-40, 40]);

    const floatAnim: TargetAndTransition = {
        y: [0, -15, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Top Bar for Logo and Theme Toggle */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <Link to="/welcome" className="flex items-center gap-3 pointer-events-auto group">
                    <SecondBrainLogo className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-md transition-transform group-hover:scale-105" />
                    <span className="text-xl lg:text-2xl font-bold font-sans tracking-tight drop-shadow-sm">Second Brain</span>
                </Link>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="pointer-events-auto p-2 rounded-full bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* LEFT SIDE - Hero Section (Hidden on Mobile) */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden"
            >
                {/* Background Ambient Glows */}
                <motion.div
                    style={{ x: backgroundMoveX, y: backgroundMoveY }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary rounded-full mix-blend-screen opacity-20 blur-[100px]" />
                    <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-purple-600 rounded-full mix-blend-screen opacity-20 blur-[100px]" />
                </motion.div>

                {/* Grid Overlay */}
                <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBINDBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFFMjkzQiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjUiLz4KPHBhdGggZD0iTTAgMFY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMUUyOTNCIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')] ${isDarkMode ? 'opacity-20' : 'opacity-[0.05]'} z-0`} />

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col items-center max-w-lg text-center mt-12">

                    {/* Glowing Abstract Brain Diagram */}
                    <motion.div
                        style={{ x: brainMoveX, y: brainMoveY }}
                        animate={floatAnim}
                        className="relative w-64 h-64 mb-12"
                    >
                        {/* Brain Core Glow */}
                        <div className="absolute inset-0 bg-primary blur-[60px] opacity-40 rounded-full scale-75 animate-pulse" />

                        {/* Stylized Node Network representing a brain */}
                        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
                            <motion.path
                                d="M100 20 C60 20 30 50 30 90 C30 130 50 150 70 170 C80 180 90 180 100 180 C110 180 120 180 130 170 C150 150 170 130 170 90 C170 50 140 20 100 20 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="opacity-50"
                            />
                            <motion.path
                                d="M100 40 C70 40 50 60 50 90 C50 120 70 140 85 150 C95 155 105 155 115 150 C130 140 150 120 150 90 C150 60 130 40 100 40 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                animate={{ rotate: [360, 0] }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                className="opacity-70"
                            />
                            {/* Inner Nodes */}
                            <circle cx="100" cy="90" r="4" fill="currentColor" />
                            <circle cx="70" cy="80" r="3" fill="currentColor" />
                            <circle cx="130" cy="80" r="3" fill="currentColor" />
                            <circle cx="85" cy="115" r="3" fill="currentColor" />
                            <circle cx="115" cy="115" r="3" fill="currentColor" />
                            <circle cx="100" cy="60" r="3" fill="currentColor" />

                            {/* Connecting lines */}
                            <path d="M100 90 L70 80 M100 90 L130 80 M100 90 L85 115 M100 90 L115 115 M100 90 L100 60" stroke="currentColor" strokeWidth="1" className="opacity-60" />
                            <path d="M70 80 L100 60 L130 80 L115 115 L85 115 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-40" />
                        </svg>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-4xl lg:text-5xl font-bold tracking-tight mb-4"
                        style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                    >
                        Your digital <span className="text-primary">Second Brain</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
                    >
                        Capture, organize, and synthesize your knowledge in a beautifully seamless environment.
                    </motion.p>
                </div>
            </div>

            {/* RIGHT SIDE - Authentication Form (Full width on mobile) */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative z-20 overflow-y-auto">
                {/* Mobile ambient background */}
                <div className="lg:hidden absolute inset-0 bg-background z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-screen opacity-10 blur-[80px]" />
                </div>

                <div className="w-full max-w-md relative z-10 pt-16 lg:pt-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-card p-8 rounded-2xl border border-border shadow-2xl overflow-hidden"
                    >
                        {typeof children === 'function' ? children(isDarkMode) : children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
