import { motion } from 'framer-motion';

export function SkeletonNoteCard() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl p-5 mb-4 border border-border shadow-sm break-inside-avoid"
        >
            {/* Header Block */}
            <div className="flex justify-between items-start mb-4 gap-3">
                <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700/50 rounded-md animate-pulse" />
                        <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700/50 rounded-md animate-pulse ml-auto" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700/50 rounded-md animate-pulse mt-1" />
                </div>
            </div>

            {/* Body Block */}
            <div className="h-[120px] w-full bg-gray-200 dark:bg-slate-700/50 rounded-lg animate-pulse mb-4" />

            {/* Footer Block */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
                    <div className="h-5 w-12 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
                </div>
                <div className="h-5 w-6 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
            </div>
        </motion.div>
    );
}
