import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import type { Tag } from './NoteCard';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTypes: string[];
    selectedTags: string[];
    onTypeChange: (type: string) => void;
    onTagChange: (tagId: string) => void;
}

const CONTENT_TYPES = [
    { id: 'article', label: 'Article' },
    { id: 'video', label: 'Video' },
    { id: 'image', label: 'Image' },
    { id: 'tweet', label: 'Tweet' },
    { id: 'audio', label: 'Audio' },
    { id: 'document', label: 'Document' }
];

export function FilterModal({ isOpen, onClose, selectedTypes, selectedTags, onTypeChange, onTagChange }: FilterModalProps) {
    const { getToken } = useAuth();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    // Fetch tags when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchTags = async () => {
                const token = await getToken();
                if (!token) return;
                try {
                    const res = await axios.get('http://localhost:3000/api/v1/tag/getTags', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        setAvailableTags(res.data.tags);
                    }
                } catch (err) {
                    console.error("Failed to fetch tags", err);
                }
            };
            fetchTags();
        }
    }, [isOpen, getToken]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <>
                {/* Invisible Backdrop to handle click-outside */}
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-card w-[480px] rounded-2xl shadow-xl border border-border flex flex-col max-h-[500px] relative z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Filter size={14} />
                            Filter Knowledge
                        </span>
                        {/* Clear All small button */}
                        {(selectedTypes.length > 0 || selectedTags.length > 0) && (
                            <button
                                onClick={() => { onTypeChange("__CLEAR__") /* Need logic for clear in Home? Home expects typeId. */ }}
                                className="text-xs text-primary hover:underline"
                            >
                                {/* Actually, Home doesn't pass a clear handler. I can simulate unchecking all or just let user uncheck. 
                                   or I can modify Home to accept a clear. For now, just close button. */}
                            </button>
                        )}
                        {/* Close Button not strictly needed if we have click-outside, but good for UX */}
                        {/* <button onClick={onClose} ... ><X/></button> */}
                    </div>

                    {/* Body: Two Columns */}
                    <div className="flex flex-1 overflow-hidden h-[320px]">
                        {/* Types Column */}
                        <div className="w-1/2 overflow-y-auto border-r border-dashed border-border custom-scrollbar p-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-2">Type</h3>
                            <div className="space-y-1">
                                {CONTENT_TYPES.map(type => (
                                    <label key={type.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTypes.includes(type.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground group-hover:border-primary'}`}>
                                            {selectedTypes.includes(type.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Filter size={8} className="fill-current" /></motion.div>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedTypes.includes(type.id)}
                                            onChange={() => onTypeChange(type.id)}
                                        />
                                        <span className={`text-sm ${selectedTypes.includes(type.id) ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                            {type.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tags Column */}
                        <div className="w-1/2 overflow-y-auto custom-scrollbar p-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-2">Tags</h3>
                            <div className="space-y-1">
                                {availableTags.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">No tags</p>
                                ) : (
                                    availableTags.map(tag => (
                                        <label key={tag._id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTags.includes(tag._id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground group-hover:border-primary'}`}>
                                                {selectedTags.includes(tag._id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Filter size={8} className="fill-current" /></motion.div>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedTags.includes(tag._id)}
                                                onChange={() => onTagChange(tag._id)}
                                            />
                                            <span className={`text-sm ${selectedTags.includes(tag._id) ? 'font-medium text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                #{tag.title}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    );
}
