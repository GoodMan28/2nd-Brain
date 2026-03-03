import { Share2, MoreHorizontal, FileText, Image as ImageIcon, Video, Twitter, File, Music, Link, Edit, Trash2, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { EditContentModal } from './EditContentModal';
import { ShareContentModal } from './ShareContentModal';

export interface Tag {
    _id: string;
    title: string;
}

export interface NoteProps {
    id: string;
    title: string;
    excerpt: string;
    tags: Tag[];
    type?: 'image' | 'video' | 'article' | 'audio' | 'tweet' | 'document' | 'other';
    link?: string;
    links?: string[];
    image?: string;
    date: string;
    onDelete?: () => void;
    onUpdate?: () => void;
}

const getTypeConfig = (type: string = 'article') => {
    const commonClasses = "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors";
    switch (type) {
        case 'video': return { icon: Video, label: 'Video', color: commonClasses };
        case 'image': return { icon: ImageIcon, label: 'Image', color: commonClasses };
        case 'tweet': return { icon: Twitter, label: 'Tweet', color: commonClasses };
        case 'audio': return { icon: Music, label: 'Audio', color: commonClasses };
        case 'document': return { icon: File, label: 'Doc', color: commonClasses };
        case 'article': return { icon: FileText, label: 'Article', color: commonClasses };
        default: return { icon: Link, label: 'Link', color: commonClasses };
    }
}

export function NoteCard({ note, onDelete, onUpdate }: { note: NoteProps, onDelete?: () => void, onUpdate?: () => void }) {
    const { icon: TypeIcon, label, color } = getTypeConfig(note.type);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                onClick={() => setIsDetailModalOpen(true)}
                className="bg-card rounded-xl p-5 mb-4 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer relative overflow-visible break-inside-avoid"
            >
                <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                <TypeIcon size={10} />
                                {label}
                            </span>
                            <span className="text-muted-foreground text-xs">{note.date}</span>
                        </div>
                        <h3 className="font-bold text-lg text-card-foreground leading-tight group-hover:text-primary transition-colors">
                            {note.title}
                        </h3>
                    </div>
                </div>

                {/* Media Preview Logic */}
                {/* Media Preview Logic */}
                {/* 1. If multiple items (links/images) exist, show the first as preview + "more" text */}
                {(note.links && note.links.length > 0) ? (
                    <div className="mb-4 relative group/media">
                        {/* Determine if first item is image */}
                        {(() => {
                            const firstLink = note.links![0];
                            const isPdf = firstLink.match(/\.pdf$/i);
                            const isImage = !isPdf && (firstLink.match(/\.(jpeg|jpg|gif|png|webp)$/i) || firstLink.includes("imagekit.io"));

                            return isImage ? (
                                <div className="rounded-lg overflow-hidden h-40 w-full bg-muted relative">
                                    <img
                                        src={firstLink}
                                        alt={note.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                    {note.links!.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                                            +{note.links!.length - 1} more
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg h-40 w-full bg-secondary/30 flex items-center justify-center border border-border/50 relative p-4 text-center">
                                    <Link size={32} className="text-primary/50 mb-2" />
                                    <span className="text-xs text-muted-foreground w-full truncate block">{firstLink}</span>
                                    {note.links!.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded-md border border-border">
                                            +{note.links!.length - 1} more
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (note.type === 'image' || (note.image && !note.type)) && (
                    <div className="mb-4 rounded-lg overflow-hidden h-40 w-full bg-muted">
                        <img
                            src={note.link || note.image}
                            alt={note.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}



                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {note.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <div className="flex gap-2 flex-wrap">
                        {note.tags.map(tag => (
                            <span key={tag._id} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors">
                                #{tag.title}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-1 items-center">
                        <button
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsShareModalOpen(true);
                            }}
                            title="Share"
                        >
                            <Share2 size={16} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100 ${isMenuOpen ? 'opacity-100 bg-accent text-foreground' : ''}`}
                            >
                                <MoreHorizontal size={16} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-0 bottom-full mb-2 w-36 rounded-xl bg-card/75 backdrop-blur-md border border-border/50 shadow-xl z-50 overflow-hidden p-1 flex flex-col gap-0.5 origin-bottom-right"
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); setIsMenuOpen(false); }}
                                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors w-full text-left"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsDetailModalOpen(true); setIsMenuOpen(false); }}
                                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors w-full text-left"
                                        >
                                            <ExternalLink size={14} />
                                            Open
                                        </button>
                                        <div className="h-px bg-border/50 my-0.5" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}
                                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Detail View Modal */}
            <AnimatePresence>
                {isDetailModalOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
                        onClick={(e) => { e.stopPropagation(); setIsDetailModalOpen(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-border/50 flex justify-between items-start gap-4 bg-muted/20">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${color}`}>
                                            <TypeIcon size={12} />
                                            {label}
                                        </span>
                                        <span className="text-muted-foreground text-sm">{note.date}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-card-foreground leading-tight">
                                        {note.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 custom-scrollbar">
                                {/* Media / Link Preview */}
                                {/* Multi-Media / Link Preview */}
                                {(note.links && note.links.length > 0) ? (
                                    <div className="space-y-4 mb-6">
                                        {note.links.map((link, idx) => {
                                            const isPdf = link.match(/\.pdf$/i);
                                            const isImage = !isPdf && (link.match(/\.(jpeg|jpg|gif|png|webp)$/i) || link.includes("imagekit.io"));

                                            if (isImage) {
                                                return (
                                                    <div key={idx} className="rounded-2xl overflow-hidden bg-muted/30 border border-border/50 shadow-sm">
                                                        <img
                                                            src={link}
                                                            alt={`${note.title} - ${idx + 1}`}
                                                            className="w-full h-auto object-contain max-h-[500px]"
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <a
                                                        key={idx}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3 text-primary">
                                                            <Link size={18} />
                                                            <span className="font-medium truncate underline-offset-4 group-hover:underline">{link}</span>
                                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                                        </div>
                                                    </a>
                                                );
                                            }
                                        })}
                                    </div>
                                ) : (
                                    // Fallback for older notes without links array
                                    <>
                                        {note.image && (
                                            <div className="mb-6 rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
                                                <img
                                                    src={note.image}
                                                    alt={note.title}
                                                    className="w-full h-auto object-contain max-h-[500px]"
                                                />
                                            </div>
                                        )}
                                        {note.link && note.type !== 'image' && (
                                            <a
                                                href={note.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mb-6 block p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 text-primary">
                                                    <Link size={18} />
                                                    <span className="font-medium truncate underline-offset-4 group-hover:underline">{note.link}</span>
                                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                                </div>
                                            </a>
                                        )}
                                    </>
                                )}

                                {/* Tags */}
                                {note.tags.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-6">
                                        {note.tags.map(tag => (
                                            <span key={tag._id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                                                #{tag.title}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground">
                                    <p className="whitespace-pre-wrap leading-relaxed">{note.excerpt}</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsShareModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-xl transition-all"
                                >
                                    <Share2 size={16} />
                                    Share
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-xl transition-all"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <EditContentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onContentUpdated={() => {
                    if (onUpdate) onUpdate();
                    setIsEditModalOpen(false);
                }}
                initialData={{
                    id: note.id,
                    title: note.title,
                    description: note.excerpt,
                    tags: note.tags,
                    link: note.link,
                    links: note.links, // Pass links
                    type: note.type
                }}
            />

            {/* Share Modal */}
            <ShareContentModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                contentId={note.id}
                title={note.title}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (

                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
                        onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                                        <Trash2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Delete Note</h3>
                                        <p className="text-sm text-muted-foreground">Are you sure?</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    This action cannot be undone. This note will be permanently removed from your brain.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (onDelete) onDelete();
                                            setIsDeleteModalOpen(false);
                                        }}
                                        className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
