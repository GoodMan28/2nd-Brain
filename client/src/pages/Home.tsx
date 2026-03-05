import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MasonryGrid } from '../components/MasonryGrid';
import { SkeletonNoteCard } from '../components/SkeletonNoteCard';
import { NoteCard } from '../components/NoteCard';
import type { NoteProps } from '../components/NoteCard';
import { AddContentModal } from '../components/AddContentModal';
import { SharedContentModal } from '../components/SharedContentModal';
import { FilterModal } from '../components/FilterModal';
import { Search, Plus, Filter, Lock, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth, useUser } from '@clerk/clerk-react';

export function Home() {
    const { shareToken } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Filter State
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Debounce filter values to prevent excessive DB calls
    const debouncedTypes = useDebounce(selectedTypes, 500);
    const debouncedTags = useDebounce(selectedTags, 500);

    const [notes, setNotes] = useState<NoteProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { getToken, isSignedIn, isLoaded, userId } = useAuth();
    const { user } = useUser();

    // Share Modal State
    const [sharedContent, setSharedContent] = useState<any>(null);
    const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);
    const [canFork, setCanFork] = useState(false);
    const [sharedFetchError, setSharedFetchError] = useState<string>("");

    // Handle Shared Content Loading
    useEffect(() => {
        const loadSharedContent = async () => {
            if (!shareToken) return;

            try {
                // Public endpoint, no auth header needed strictly, but if user is logged in backend might use it.
                // Our backend logic for GET /:shareToken doesn't use userId, works purely on token.
                const res = await axios.get(`https://twond-brain-backend-an44.onrender.com/api/v1/share/${shareToken}`);

                if (res.data.content) {
                    setSharedContent(res.data.content);
                    setCanFork(res.data.canFork);
                    setSharedFetchError("");
                    setIsSharedModalOpen(true);
                }
            } catch (err: any) {
                console.error("Failed to load shared content", err);
                setSharedContent(null);
                setSharedFetchError(err.response?.data?.message || "Link invalid or expired");
                setIsSharedModalOpen(true);
            }
        };

        if (shareToken) {
            loadSharedContent();
        }
    }, [shareToken]);

    const fetchNotes = async () => {
        if (!isLoaded) return;

        setLoading(true);
        setError('');

        if (!isSignedIn) {
            setLoading(false);
            return;
        }

        try {
            const token = await getToken();

            // Use POST /getContent for filtering support
            const response = await axios.post("https://twond-brain-backend-an44.onrender.com/api/v1/content/getContent",
                {
                    type: debouncedTypes,
                    tags: debouncedTags
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const mappedNotes: NoteProps[] = response.data.content.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    excerpt: item.description || '',
                    tags: (item.tags || []).map((t: any) => ({
                        _id: t._id,
                        title: t.title
                    })),
                    date: new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    type: item.type,
                    link: item.link,
                    links: item.links || [], // Map new links array
                    image: item.type === 'image' ? item.link : undefined // Backward compatibility if needed
                }));
                setNotes(mappedNotes);
            } else {
                setError(response.data.msg || "Failed to load content");
            }
        } catch (error: any) {
            console.error("Failed to fetch notes:", error);
            setError("Could not connect to the Brain. Check if server is running.");
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters change (debounced)
    useEffect(() => {
        if (isLoaded) fetchNotes();
    }, [debouncedTypes, debouncedTags, isLoaded, isSignedIn, getToken]);

    const handleContentAdded = () => {
        fetchNotes();
        setIsModalOpen(false);
    };

    // Filter Handlers
    const toggleType = (typeId: string) => {
        setSelectedTypes(prev =>
            prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
        );
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async () => {
        if (!isLoaded || !isSignedIn) return;

        if (!searchQuery.trim()) {
            fetchNotes();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = await getToken();
            const response = await axios.post("https://twond-brain-backend-an44.onrender.com/api/v1/content/search",
                { query: searchQuery },
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            if (response.data.success) {
                const mappedNotes: NoteProps[] = response.data.results.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    excerpt: item.description || '',
                    tags: (item.tags || []).map((t: any) => ({
                        _id: t._id,
                        title: t.title
                    })),
                    date: new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    type: item.type,
                    link: item.link,
                    links: item.links || [],
                    image: item.type === 'image' ? item.link : undefined
                }));
                setNotes(mappedNotes);
            } else {
                setError(response.data.msg || "Failed to search content");
            }
        } catch (error) {
            console.error("Search failed", error);
            setError("Search failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <AddContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContentAdded={handleContentAdded}
            />

            <SharedContentModal
                isOpen={isSharedModalOpen}
                onClose={() => {
                    setIsSharedModalOpen(false);
                    navigate('/'); // Clear URL
                    // Don't clear sharedContent immediately to prevent flash before animation ends
                    setTimeout(() => setSharedFetchError(""), 300);
                }}
                content={sharedContent}
                canFork={canFork}
                shareToken={shareToken}
                onForkSuccess={fetchNotes}
                fetchError={sharedFetchError}
            />

            {/* Header Section */}
            {!loading && isSignedIn && (
                <div className="mb-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{user?.firstName || 'User'}</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {notes.length > 0
                            ? `You have captured ${notes.length} ideas in your second brain.`
                            : "Ready to capture your first idea today?"}
                    </p>
                </div>
            )}

            {/* Floating Header / Search Area */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-6 z-20">
                <div className="relative flex-1 max-w-2xl group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="block w-full pl-11 pr-32 py-3 bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-base placeholder:text-muted-foreground/70"
                        placeholder="Search your brain..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    searchInputRef.current?.focus();
                                }}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            onClick={handleSearch}
                            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            Search
                        </button>
                        <button
                            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                            className={`p-2 rounded-xl transition-colors ${selectedTypes.length > 0 || selectedTags.length > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <Filter size={18} />
                            {(selectedTypes.length > 0 || selectedTags.length > 0) && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                    </div>

                    <div className="absolute top-full right-0 mt-2 z-50">
                        <FilterModal
                            isOpen={isFilterModalOpen}
                            onClose={() => setIsFilterModalOpen(false)}
                            selectedTypes={selectedTypes}
                            selectedTags={selectedTags}
                            onTypeChange={toggleType}
                            onTagChange={toggleTag}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 hover:scale-105 text-sm"
                    >
                        <Plus size={18} />
                        <span>Add Content</span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="mt-8">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Knowledge</h2>
                    {/* Active Filter Badges */}
                    {(selectedTypes.length > 0 || selectedTags.length > 0) && (
                        <div className="flex gap-2">
                            {selectedTypes.length > 0 && <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">Types: {selectedTypes.length}</span>}
                            {selectedTags.length > 0 && <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">Tags: {selectedTags.length}</span>}
                            <button onClick={() => { setSelectedTags([]); setSelectedTypes([]); }} className="text-xs text-muted-foreground hover:text-foreground underline">Clear All</button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <MasonryGrid>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonNoteCard key={i} />
                        ))}
                    </MasonryGrid>
                ) : !isSignedIn ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Lock size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Not Signed In</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            You need to be logged in to access your Second Brain content and manage your notes.
                        </p>
                        <Link
                            to="/signin"
                            className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-destructive bg-destructive/10 rounded-xl">
                        <p>{error}</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                        <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
                        <p className="text-muted-foreground mb-6">
                            {(selectedTypes.length > 0 || selectedTags.length > 0)
                                ? "Try adjusting your filters to see more content."
                                : "Start building your second brain by adding a new note."}
                        </p>
                        <button
                            onClick={() => {
                                if (selectedTypes.length > 0 || selectedTags.length > 0) {
                                    setSelectedTags([]); setSelectedTypes([]);
                                } else {
                                    setIsModalOpen(true);
                                }
                            }}
                            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            {(selectedTypes.length > 0 || selectedTags.length > 0) ? "Clear Filters" : "Create First Note"}
                        </button>
                    </div>
                ) : (
                    <MasonryGrid>
                        <AnimatePresence mode="popLayout">
                            {notes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onDelete={async () => {
                                        try {
                                            const token = await getToken();
                                            if (!token) return;
                                            await axios.post("https://twond-brain-backend-an44.onrender.com/api/v1/content/deleteContent",
                                                { contentId: note.id },
                                                { headers: { "Authorization": `Bearer ${token}` } }
                                            );
                                            setNotes(prev => prev.filter(n => n.id !== note.id));
                                        } catch (err) {
                                            console.error("Failed to delete note", err);
                                            alert("Failed to delete note");
                                        }
                                    }}
                                    onUpdate={fetchNotes}
                                />
                            ))}
                        </AnimatePresence>
                    </MasonryGrid>
                )}
            </div>
        </div >
    );
}
