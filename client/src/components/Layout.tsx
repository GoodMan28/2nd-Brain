import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { UserButton } from '@clerk/clerk-react';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <main className="ml-[80px] md:ml-[260px] transition-[margin] duration-300 min-h-screen bg-background flex flex-col">
                {/* Top Bar */}
                <header className="h-16 border-b border-border flex items-center justify-end px-6 bg-card">
                    <UserButton />
                </header>

                <div className="max-w-[1600px] mx-auto w-full p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
