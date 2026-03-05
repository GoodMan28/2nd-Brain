import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BubbleChart } from '../components/BubbleChart';
import { Trash2, Merge, RefreshCw, AlertTriangle, ArrowRight, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';

interface TagAnalytics {
    _id: string; // tagId
    title: string;
    usageCount: number;
    color: string;
}

interface LinkAnalytics {
    source: string;
    target: string;
    value: number;
}

export function Tags() {
    const { getToken } = useAuth();
    const [tags, setTags] = useState<TagAnalytics[]>([]);
    const [links, setLinks] = useState<LinkAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Merge State
    const [mergingTag, setMergingTag] = useState<TagAnalytics | null>(null); // The source tag
    const [targetTagId, setTargetTagId] = useState<string>('');
    const [isMergeProcessing, setIsMergeProcessing] = useState(false);

    // Delete State
    const [deletingTag, setDeletingTag] = useState<TagAnalytics | null>(null);
    // Conflict Warning State
    const [deleteConflict, setDeleteConflict] = useState<{ count: number, msg: string } | null>(null);

    // Bulk Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);


    const fetchTags = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            if (!token) { setLoading(false); return; }

            const res = await axios.get('http://localhost:3000/api/v1/tag/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                // Backend now returns { nodes, links }
                setTags(res.data.nodes || []);
                setLinks(res.data.links || []);
            }
        } catch (err) {
            console.error("Failed to fetch tags", err);
            setError("Failed to load tags.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [getToken]);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedTagIds(new Set());
    };

    const toggleTagSelection = (tagId: string) => {
        const newSet = new Set(selectedTagIds);
        if (newSet.has(tagId)) {
            newSet.delete(tagId);
        } else {
            newSet.add(tagId);
        }
        setSelectedTagIds(newSet);
    };

    const handleDelete = async (tag: TagAnalytics) => {
        try {
            const token = await getToken();
            if (!token) return;

            await axios.post('http://localhost:3000/api/v1/tag/deleteTag',
                { tagId: tag._id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Success
            setTags(prev => prev.filter(t => t._id !== tag._id));
            setDeletingTag(null);
            setDeleteConflict(null);

        } catch (err: any) {
            if (err.response && err.response.status === 409) {
                setDeleteConflict({
                    count: err.response.data.count,
                    msg: err.response.data.msg
                });
            } else {
                alert("Failed to delete tag");
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTagIds.size === 0) return;
        setIsBulkDeleting(true);

        try {
            const token = await getToken();
            if (!token) { setIsBulkDeleting(false); return; }

            await axios.post('http://localhost:3000/api/v1/tag/deleteTags',
                { tagIds: Array.from(selectedTagIds) },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Success
            await fetchTags();
            setIsSelectionMode(false);
            setSelectedTagIds(new Set());
            setDeleteConflict(null);

        } catch (err: any) {
            if (err.response && err.response.status === 409) {
                // Show conflict modal using the existing state logic, adapted for bulk
                setDeleteConflict({
                    count: err.response.data.count, // Total usage count
                    msg: "One or more selected tags are in use."
                });
                // We don't clear selection so user can adjust
            } else {
                alert("Failed to delete tags");
            }
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleMerge = async () => {
        if (!mergingTag || !targetTagId) return;
        setIsMergeProcessing(true);

        try {
            const token = await getToken();
            if (!token) { setIsMergeProcessing(false); return; }

            await axios.post('http://localhost:3000/api/v1/tag/mergeTags',
                { sourceTagId: mergingTag._id, targetTagId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Success
            await fetchTags(); // Refetch to rebuild graph/counts
            setMergingTag(null);
            setTargetTagId('');

        } catch (err) {
            console.error(err);
            alert("Merge failed");
        } finally {
            setIsMergeProcessing(false);
        }
    };

    const sortedTags = useMemo(() => {
        return [...tags].sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.usageCount - a.usageCount;
            } else {
                return a.usageCount - b.usageCount;
            }
        });
    }, [tags, sortOrder]);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Tags Management</h1>
                    <p className="text-muted-foreground mt-1">Visualize and organize your knowledge graph.</p>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {/* Bubble Chart Section */}
            <div className="mb-10">
                <BubbleChart
                    tags={tags.filter(t => t.usageCount > 0).map(t => ({ id: t._id, name: t.title, usageCount: t.usageCount, color: t.color }))}
                    links={links}
                    height={400}
                    width={800} // Responsive wrapper handled by CSS? Chart takes fixed width props usually. Wrapper needed.
                    onTagClick={(id) => {
                        const tag = tags.find(t => t._id === id);
                        if (tag) {
                            // Scroll to tag card or open details?
                            document.getElementById(`tag-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            document.getElementById(`tag-${id}`)?.classList.add('ring-2', 'ring-primary');
                            setTimeout(() => document.getElementById(`tag-${id}`)?.classList.remove('ring-2', 'ring-primary'), 2000);
                        }
                    }}
                />
            </div>

            {/* Tags Grid Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-foreground">All Tags ({sortedTags.length})</h2>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={toggleSelectionMode}
                        className={`px-4 py-2 rounded-xl transition-colors font-medium text-sm ${isSelectionMode ? 'bg-secondary text-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                        {isSelectionMode ? "Cancel Selection" : "Select Tags"}
                    </button>
                    {isSelectionMode && selectedTagIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl transition-colors font-medium text-sm flex items-center gap-2 hover:bg-destructive/90"
                        >
                            {isBulkDeleting ? <RefreshCw className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            Delete ({selectedTagIds.size})
                        </button>
                    )}
                    <button
                        onClick={fetchTags}
                        className="p-2 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors text-foreground"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="p-2 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors text-foreground flex items-center gap-2"
                        title={`Sort by Usage (${sortOrder === 'desc' ? 'Descending' : 'Ascending'})`}
                    >
                        {sortOrder === 'desc' ? <ArrowDownWideNarrow size={20} /> : <ArrowUpNarrowWide size={20} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {sortedTags.map(tag => (
                        <motion.div
                            key={tag._id}
                            id={`tag-${tag._id}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => isSelectionMode && toggleTagSelection(tag._id)}
                            className={`
                                relative bg-card border rounded-xl p-4 flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer
                                ${isSelectionMode ? 'hover:border-primary/50' : ''}
                                ${selectedTagIds.has(tag._id) ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}
                            `}
                        >
                            {/* Selection Checkbox Overlay */}
                            {isSelectionMode && (
                                <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedTagIds.has(tag._id) ? 'bg-primary border-primary text-white' : 'border-muted-foreground/30 bg-background'}`}>
                                    {selectedTagIds.has(tag._id) && <ArrowRight size={12} className="rotate-45" />}
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-2 pr-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></span>
                                    <h3 className="font-bold text-foreground line-clamp-1" title={tag.title}>#{tag.title}</h3>
                                </div>
                                {!isSelectionMode && (
                                    <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                                        {tag.usageCount}
                                    </span>
                                )}
                            </div>

                            {/* Actions only visible when NOT in selection mode */}
                            {!isSelectionMode && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMergingTag(tag); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                                    >
                                        <Merge size={14} /> Merge
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingTag(tag); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )}

                            {/* If in selection mode, maybe show usage count differently or hide to reduce clutter? kept it hidden above in flex header */}
                            {isSelectionMode && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                    Usage: {tag.usageCount}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Merge Modal */}
            <AnimatePresence>
                {mergingTag && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setMergingTag(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Merge className="text-blue-500" />
                                Merge Tag
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Merging <strong>#{mergingTag.title}</strong> into another tag will move all {mergingTag.usageCount} items to the target tag, and delete #{mergingTag.title} permanently.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Target Tag</label>
                                    <select
                                        className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                                        value={targetTagId}
                                        onChange={(e) => setTargetTagId(e.target.value)}
                                    >
                                        <option value="">Choose a tag...</option>
                                        {tags.filter(t => t._id !== mergingTag._id).map(t => (
                                            <option key={t._id} value={t._id}>#{t.title} ({t.usageCount})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setMergingTag(null)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                                    <button
                                        onClick={handleMerge}
                                        disabled={!targetTagId || isMergeProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isMergeProcessing ? <RefreshCw className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                                        Merge & Delete Source
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Warning Modal - Reused for Single & Bulk */}
            <AnimatePresence>
                {(deletingTag || deleteConflict) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => { setDeletingTag(null); setDeleteConflict(null); }}
                    >
                        <div
                            className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-2 text-destructive flex items-center gap-2">
                                <AlertTriangle />
                                {deleteConflict ? "Cannot Delete Tags" : "Delete Tag?"}
                            </h3>

                            {deleteConflict ? (
                                <>
                                    <p className="text-sm text-foreground mb-4">
                                        {deleteConflict.msg || `This tag is currently used by ${deleteConflict.count} items.`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        You must remove the tags from your content or <strong>Merge</strong> them before deletion.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setDeletingTag(null); setDeleteConflict(null); }}
                                            className="w-full py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl font-medium"
                                        >
                                            Okay
                                        </button>
                                    </div>
                                </>
                            ) : deletingTag && (
                                <>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Are you sure you want to delete <strong>#{deletingTag.title}</strong>? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setDeletingTag(null)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Cancel</button>
                                        <button
                                            onClick={() => handleDelete(deletingTag)}
                                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl font-medium hover:bg-destructive/90 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
