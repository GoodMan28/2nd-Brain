import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Share2, Sparkles, Shield, ArrowRight, Moon, Sun } from 'lucide-react';

import { SecondBrainLogo } from '../components/ui/icons/SecondBrainLogo';

export function Welcome() {
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

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Background Gradients */}
            {/* Background Gradients & Grid */}
            <div className="absolute inset-0 overflow-hidden -z-10 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05]">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[130px]" />
            </div>

            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 lg:gap-3">
                    <SecondBrainLogo className="w-10 h-10 shadow-lg shadow-primary/20 rounded-xl" />
                    <span className="font-bold text-xl tracking-tight">Second Brain</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <Link to="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-4 border border-border">
                        <Sparkles size={12} className="text-primary" />
                        <span>AI-Powered Knowledge Management</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Your Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Extension</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Capture thoughts, bookmark content, and let AI organize your digital life.
                        The second brain you've always needed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Link
                                to="/signup"
                                className="relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Start for Free <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        No credit card required. Free forever for individuals.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-24"
                >
                    <FeatureCard
                        icon={Share2}
                        title="Seamless Sharing"
                        description="Share your notes and collections with a single click. Collaborate instantly."
                    />
                    <FeatureCard
                        icon={SecondBrainLogo}
                        title="AI Integration"
                        description="Auto-tagging, summarization, and smart search powered by advanced AI."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Private & Secure"
                        description="Your data is encrypted and yours alone. Enterprise-grade security."
                    />
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50 bg-background/50 backdrop-blur-sm">
                <p>© {new Date().getFullYear()} Second Brain. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all text-left group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
