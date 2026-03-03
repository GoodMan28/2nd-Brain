import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Library,
    Share2,
    Tags,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    to: string;
    isCollapsed: boolean;
}

const NavItem = ({ icon: Icon, label, to, isCollapsed }: NavItemProps) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center w-full p-3 rounded-xl transition-all group relative border border-transparent overflow-hidden",
            isActive
                ? "bg-gradient-to-r from-blue-50 to-transparent text-primary font-semibold shadow-sm border-l-4 border-l-primary border-y-transparent border-r-transparent rounded-l-sm"
                : "text-muted-foreground hover:bg-white/50 hover:text-foreground hover:shadow-sm hover:border-gray-100",
            isCollapsed ? "justify-center" : "justify-start gap-3"
        )}
        title={isCollapsed ? label : undefined}
    >
        {({ isActive }) => (
            <>
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-all duration-300", isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-105")} />
                {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap overflow-hidden tracking-wide">
                        {label}
                    </span>
                )}
                {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white/90 backdrop-blur-md text-foreground text-xs font-medium rounded-lg border border-gray-200/50 opacity-0 group-hover:opacity-100 transition-all z-50 whitespace-nowrap pointer-events-none shadow-xl translate-x-2 group-hover:translate-x-0">
                        {label}
                    </div>
                )}
            </>
        )}
    </NavLink>
);

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Mapped to specific routes
    const navItems = [
        { icon: Library, label: 'All Notes', to: '/' },
        { icon: Sparkles, label: 'AI Assistant', to: '/ai' },
        { icon: Tags, label: 'Tags', to: '/tags' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <motion.aside
            className="h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 fixed left-0 top-0 z-40 flex flex-col shadow-sm"
        >
            {/* Header */}
            <div className={cn("flex items-center p-6 h-[88px]", isCollapsed ? "justify-center" : "justify-between")}>
                <a href="/" className={cn("flex items-center gap-2 overflow-hidden", isCollapsed && "hidden")}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                        2B
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight">Second Brain</span>
                </a>
                {isCollapsed && (
                    <a href="/" className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20">
                        2B
                    </a>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-2">
                {navItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* Toggle Button */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-white/50 hover:text-foreground transition-all border border-transparent hover:border-gray-200"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /> <span className="text-sm font-medium">Collapse</span></div>}
                </button>
            </div>
        </motion.aside>
    );
}
