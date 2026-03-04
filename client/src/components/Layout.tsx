import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { UserButton } from '@clerk/clerk-react';
import { Moon, Sun } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        <div className="min-h-screen bg-background flex">
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

            <main
                className={`transition-[margin] duration-300 min-h-screen bg-background flex flex-col w-full ${isSidebarCollapsed ? "ml-[80px]" : "ml-[80px] md:ml-[260px]"
                    }`}
            >
                {/* Top Bar */}
                <header className="h-16 border-b border-border flex items-center justify-end px-6 bg-card sticky top-0 z-10 w-full gap-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <UserButton />
                </header>

                <div className="w-full flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
