import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Link as LinkIcon, Check, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../config';

// Configure Axios base URL if not already global. 
// Assuming it might be set elsewhere, but good to be safe or use relative paths if proxy is set.
// For now, I will assume a relative path or standard axios usage.

interface ShareContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contentId: string;
    title: string;
}

export function ShareContentModal({ isOpen, onClose, contentId, title }: ShareContentModalProps) {
    const { getToken } = useAuth();
    const [link, setLink] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLink("");
            setIsCopied(false);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const generateLink = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using a hardcoded URL for now based on typical setup, but arguably should be from config.
            // Assuming /api/v1/share based on controller context, but the user didn't explicitly give routes.
            // However, the controller method is `shareContent`.
            const backendUrl = `${BACKEND_URL}/api/v1/share/link`; // Adjust if needed

            const token = await getToken();

            // Actually, best to try relative first if proxy is set up or assume localhost:3000
            const response = await axios.post(backendUrl, {
                contentId
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.data && response.data.link) {
                const fullUrl = `${window.location.origin}${response.data.link}`;
                setLink(fullUrl);
            }
        } catch (err) {
            console.error("Failed to generate link:", err);
            setError("Failed to create link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const revokeLink = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            await axios.delete(`${BACKEND_URL}/api/v1/share/revoke`, {
                data: { contentId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLink("");
            setIsCopied(false);
        } catch (err) {
            console.error("Failed to revoke link", err);
            setError("Failed to revoke link.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Sparkles size={18} />
                                </div>
                                <h2 className="text-xl font-bold">Share to Web</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-medium text-foreground">Publish to the web</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create a public link for <strong>"{title}"</strong> that anyone can view.
                                </p>
                            </div>

                            {/* Link Display Area */}
                            <div className="relative group">
                                <div className={`h-12 w-full bg-secondary/50 border border-border rounded-xl flex items-center px-4 transition-all ${link ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                    {link ? link : "Link not generated yet..."}
                                </div>
                                {link && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <span className="flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 pt-2 pb-6 flex gap-3">
                            {/* Create Link Button */}
                            <button
                                onClick={generateLink}
                                disabled={isLoading || !!link}
                                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${link
                                    ? 'bg-secondary text-muted-foreground cursor-default'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Creating...
                                    </>
                                ) : link ? (
                                    <>
                                        <Check size={18} />
                                        Created
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon size={18} />
                                        Create Link
                                    </>
                                )}
                            </button>

                            {/* Copy Link Button */}
                            <button
                                onClick={copyToClipboard}
                                disabled={!link}
                                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border border-border ${!link
                                    ? 'opacity-50 cursor-not-allowed bg-secondary/50 text-muted-foreground'
                                    : isCopied
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                                        : 'bg-card text-foreground hover:bg-secondary'
                                    }`}
                            >
                                {isCopied ? (
                                    <>
                                        <Check size={18} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copy Link
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Revoke Link Button */}
                        {link && (
                            <div className="px-6 pb-6 pt-0">
                                <button
                                    onClick={revokeLink}
                                    disabled={isLoading}
                                    className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    Revoke Link (Make Private)
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
