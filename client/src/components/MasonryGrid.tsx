import type { ReactNode } from 'react';

export function MasonryGrid({ children }: { children: ReactNode }) {
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-4 pb-20">
            {children}
        </div>
    );
}
