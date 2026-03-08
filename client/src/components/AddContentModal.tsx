import { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, Link as LinkIcon, File as FileIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../config.ts';

interface AddContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContentAdded: () => void;
}

interface Tag {
    _id: string;
    title: string;
}

export function AddContentModal({ isOpen, onClose, onContentAdded }: AddContentModalProps) {
    const { getToken } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Multi-Input State
    const [inputs, setInputs] = useState<{ id: string, value: string, file: File | null }[]>([
        { id: '1', value: '', file: null }
    ]);

    // Tag State
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [tagInput, setTagInput] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [dragActiveId, setDragActiveId] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    // FETCH TAGS ON MOUNT
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const res = await axios.get(`${BACKEND_URL}/api/v1/tag/getTags`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data.success) {
                    setAvailableTags(res.data.tags);
                }
            } catch (err) {
                console.error("Failed to fetch tags", err);
            }
        };
        if (isOpen) {
            fetchTags();
            // Reset Form (Wait for animation to not look glitchy if reopening)
            setTitle('');
            setDescription('');
            setInputs([{ id: Date.now().toString(), value: '', file: null }]);
            setSelectedTags([]);
            setTagInput('');
            setIsSuccess(false);
            setIsLoading(false);
        }
    }, [isOpen, getToken]);

    // Input Handlers
    const addInput = () => {
        // Only allow adding if the last input is not empty (simple validation as requested)
        const lastInput = inputs[inputs.length - 1];
        if (!lastInput.value && !lastInput.file) return;

        setInputs([...inputs, { id: Date.now().toString(), value: '', file: null }]);
    };

    const removeInput = (id: string) => {
        if (inputs.length === 1) {
            // Reset if it's the only one
            setInputs([{ id: inputs[0].id, value: '', file: null }]);
        } else {
            setInputs(inputs.filter(i => i.id !== id));
        }
    };

    const updateInput = (id: string, field: 'value' | 'file', data: any) => {
        setInputs(inputs.map(i => {
            if (i.id === id) {
                if (field === 'value') return { ...i, value: data, file: null }; // Clear file if typing URL
                if (field === 'file') return { ...i, file: data, value: '' }; // Clear URL if file selected
            }
            return i;
        }));
    };

    // Drag & Drop
    const handleDrag = (e: React.DragEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActiveId(id);
        else if (e.type === 'dragleave') setDragActiveId(null);
    };

    const handleDrop = (e: React.DragEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        setDragActiveId(null);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            updateInput(id, 'file', e.dataTransfer.files[0]);
        }
    };

    // TAG HANDLING LOGIC (Same as before)
    const handleAddTag = async () => {
        if (!tagInput.trim()) return;
        try {
            const token = await getToken();
            if (!token) return;
            const newTagName = tagInput.trim().toLowerCase();
            if (selectedTags.find(t => t.title === newTagName)) { setTagInput(''); return; }
            const existingTag = availableTags.find(t => t.title === newTagName);
            if (existingTag) { setSelectedTags([...selectedTags, existingTag]); setTagInput(''); return; }

            const res = await axios.post(`${BACKEND_URL}/api/v1/tag/addTag`,
                { title: newTagName }, { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.data.success && res.data.tag) {
                const newTag = res.data.tag;
                if (!availableTags.find(t => t._id === newTag._id)) setAvailableTags(prev => [...prev, newTag]);
                setSelectedTags(prev => [...prev, newTag]);
                setTagInput('');
            }
        } catch (err) { console.error("Failed to create tag", err); }
    };
    const handleTagKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } };
    const removeTag = (tagId: string) => setSelectedTags(selectedTags.filter(t => t._id !== tagId));


    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = await getToken();
            if (!token) { alert("You are not logged in!"); setIsLoading(false); return; }

            const formData = new FormData();

            // Gather links and files
            const linksToSubmit: string[] = [];
            inputs.forEach(input => {
                if (input.file) {
                    formData.append('media', input.file);
                } else if (input.value) {
                    linksToSubmit.push(input.value);
                }
            });

            const contentPayload = {
                title,
                description,
                tags: selectedTags.map(t => t._id),
                links: linksToSubmit
            };

            formData.append('contentData', JSON.stringify(contentPayload));

            await axios.post(`${BACKEND_URL}/api/v1/content/addContent`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
            });

            setIsSuccess(true);
            setTimeout(() => { onContentAdded(); onClose(); }, 1500);

        } catch (error: any) {
            console.error('Error adding content:', error);
            alert("Failed to add content.");
        } finally {
            if (!isSuccess) setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    ref={modalRef}
                    className="bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border relative max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </motion.div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Added Successfully!</h3>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                                <h2 className="text-xl font-bold text-foreground">Add New Content</h2>
                                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                {/* Dynamic Inputs */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-foreground">Content Sources</label>

                                    {inputs.map((input) => (
                                        <div key={input.id} className="relative group">
                                            {!input.file ? (
                                                <div
                                                    className={`relative flex items-center border-2 border-dashed rounded-xl transition-colors ${dragActiveId === input.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                                    onDragEnter={(e) => handleDrag(e, input.id)}
                                                    onDragLeave={(e) => handleDrag(e, input.id)}
                                                    onDragOver={(e) => handleDrag(e, input.id)}
                                                    onDrop={(e) => handleDrop(e, input.id)}
                                                >
                                                    <div className="absolute left-3 text-muted-foreground"><LinkIcon size={18} /></div>
                                                    <input
                                                        type="text"
                                                        value={input.value}
                                                        onChange={(e) => updateInput(input.id, 'value', e.target.value)}
                                                        placeholder="Paste link or drag & drop media"
                                                        className="w-full pl-10 pr-12 py-3 bg-transparent border-none rounded-xl focus:ring-0 text-foreground placeholder:text-muted-foreground/50"
                                                    />
                                                    <div className="absolute right-2 flex items-center gap-1">
                                                        <label className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg cursor-pointer transition-colors" title="Upload File">
                                                            <Upload size={18} />
                                                            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && updateInput(input.id, 'file', e.target.files[0])} />
                                                        </label>
                                                        {inputs.length > 1 && (
                                                            <button type="button" onClick={() => removeInput(input.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent rounded-lg transition-colors">
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between p-3 bg-accent border border-border rounded-xl">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 bg-card rounded-lg text-primary border border-border"><FileIcon size={20} /></div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{input.file.name}</p>
                                                            <p className="text-xs text-muted-foreground">{(input.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={() => removeInput(input.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><X size={18} /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addInput}
                                        disabled={!inputs[inputs.length - 1].value && !inputs[inputs.length - 1].file}
                                        className="text-xs font-medium text-primary hover:text-primary/90 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={14} /> Add another source
                                    </button>
                                </div>

                                {/* Title & Description */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none transition-all" placeholder="Title" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none transition-all min-h-[80px] resize-none" placeholder="Description..." />
                                    </div>
                                </div>

                                {/* Tags Input */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedTags.map(tag => (
                                            <span key={tag._id} className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md flex items-center gap-1 border border-primary shadow-sm">
                                                #{tag.title}
                                                <button type="button" onClick={() => removeTag(tag._id)} className="hover:text-red-200"><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Type to create tag..." className="w-full px-4 py-2 pr-12 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring focus:outline-none text-sm" />
                                        <button type="button" onClick={handleAddTag} disabled={!tagInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"><Plus size={18} /></button>
                                    </div>
                                    {/* Available Tags */}
                                    {availableTags.length > 0 && tagInput && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {availableTags.filter(t => t.title.includes(tagInput.toLowerCase()) && !selectedTags.find(st => st._id === t._id)).slice(0, 5).map(tag => (
                                                <button type="button" key={tag._id} onClick={() => { setSelectedTags([...selectedTags, tag]); setTagInput(''); }} className="px-2 py-1 bg-secondary text-xs rounded border hover:bg-secondary/80">#{tag.title}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="pt-2 flex justify-end gap-3 shrink-0">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-muted-foreground font-medium hover:bg-accent transition-colors" disabled={isLoading}>Cancel</button>
                                    <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add Content
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
