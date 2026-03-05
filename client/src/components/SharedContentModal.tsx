import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitFork, ExternalLink, Tag, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Reusing interfaces if possible, but defining here for self-containment/ease
interface SharedContent {
    _id: string;
    title: string;
    description?: string;
    tags: { _id: string; title: string }[];
    type: string;
    link?: string;
    links?: string[]; // Add links array support
}

interface SharedContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: SharedContent | null;
    canFork: boolean;
    shareToken: string | undefined;
    onForkSuccess?: () => void;
    fetchError?: string;
}

export function SharedContentModal({ isOpen, onClose, content, canFork, shareToken, onForkSuccess, fetchError }: SharedContentModalProps) {
    const { isSignedIn, getToken } = useAuth();
    const [isForking, setIsForking] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);

    // Check if user is logged in
    const isLoggedIn = !!isSignedIn;

    if (!isOpen || (!content && !fetchError)) return null;

    const handleFork = async () => {
        if (!isLoggedIn) return;

        setIsForking(true);
        setError('');
        try {
            const token = await getToken();
            await axios.post(`https://twond-brain-backend-an44.onrender.com/api/v1/share/fork/${shareToken}`, {}, {
                headers: { "authorization": `Bearer ${token}` }
            });

            setSuccessMessage("Content forked successfully!");
            setTimeout(() => {
                if (onForkSuccess) onForkSuccess();
                navigate('/'); // Redirect to home to see the new content
                onClose();
            }, 1500);

        } catch (err: any) {
            console.error("Forking failed", err);
            setError(err.response?.data?.message || "Failed to fork content.");
        } finally {
            setIsForking(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={handleBackdropClick}
            >
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col relative"
                >
                    {/* Success Overlay */}
                    {successMessage && (
                        <div className="absolute inset-0 z-50 bg-card/90 backdrop-blur flex flex-col items-center justify-center text-center p-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4"
                            >
                                <GitFork size={32} />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Forked!</h3>
                            <p className="text-muted-foreground">{successMessage}</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-6 border-b border-border/50 flex justify-between items-start gap-4 bg-muted/20">
                        <div>
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                                Shared Content
                            </span>
                            <h2 className="text-2xl font-bold text-card-foreground leading-tight">
                                {fetchError ? "Content Unavailable" : content?.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto p-6 custom-scrollbar flex-1">
                        {fetchError ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                    <X size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Link Invalid or Expired</h3>
                                <p className="text-muted-foreground">{fetchError}</p>
                            </div>
                        ) : content ? (
                            <>
                                {/* Tags */}
                                {content.tags && content.tags.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-6">
                                        {content.tags.map(tag => (
                                            <span key={tag._id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                                <Tag size={12} />
                                                {tag.title}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Link/Media Preview if applicable */}
                                {(content.links && content.links.length > 0) ? (
                                    <div className="space-y-4 mb-6">
                                        {content.links.map((link, idx) => {
                                            const isPdf = link.match(/\.pdf$/i);
                                            const isImage = !isPdf && (link.match(/\.(jpeg|jpg|gif|png|webp)$/i) || link.includes("imagekit.io"));
                                            if (isImage) {
                                                return (
                                                    <div key={idx} className="rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
                                                        <img src={link} alt={`${content.title} - ${idx + 1}`} className="w-full h-auto object-contain max-h-[500px]" />
                                                    </div>
                                                )
                                            }
                                            return (
                                                <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group">
                                                    <div className="flex items-center gap-3 text-primary">
                                                        <ExternalLink size={18} />
                                                        <span className="font-medium truncate underline-offset-4 group-hover:underline">{link}</span>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : content.link && (
                                    // Fallback
                                    <a
                                        href={content.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-6 block p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 text-primary">
                                            <ExternalLink size={18} />
                                            <span className="font-medium truncate underline-offset-4 group-hover:underline">{content.link}</span>
                                        </div>
                                    </a>
                                )}

                                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
                                    <p className="whitespace-pre-wrap leading-relaxed">{content.description}</p>
                                </div>

                                {error && (
                                    <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between items-center gap-3">
                        {!isLoggedIn && !fetchError ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lock size={16} />
                                <span>Sign in to fork this content</span>
                            </div>
                        ) : (
                            <div>
                                {/* Spacer for layout balance */}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Close
                            </button>

                            {!fetchError && (
                                isLoggedIn ? (
                                    <button
                                        onClick={handleFork}
                                        disabled={!canFork || isForking}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md ${!canFork
                                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-primary/20'
                                            }`}
                                    >
                                        <GitFork size={16} />
                                        {isForking ? "Forking..." : "Fork to My Brain"}
                                    </button>
                                ) : (
                                    <Link
                                        to={`/signin?redirect_url=${encodeURIComponent(location.pathname)}`}
                                        className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        Sign In to Fork
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
